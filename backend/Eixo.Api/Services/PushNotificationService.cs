using System.Net.Http.Json;
using System.Text.Json;

namespace Eixo.Api.Services;

public interface IPushNotificationService
{
    Task RegisterDeviceAsync(int userId, string token);
    Task UnregisterDeviceAsync(string token, int? userId = null);
    Task SendToFamilyExceptAsync(int excludedUserId, string title, string body, object? data = null);
    Task SendToUsersAsync(IEnumerable<int> userIds, string title, string body, object? data = null);
}

public sealed class ExpoPushNotificationService : IPushNotificationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExpoPushNotificationService> _logger;
    private readonly PushDeviceStore _store;
    private static readonly Uri ExpoPushUri = new("https://exp.host/--/api/v2/push/send");

    public ExpoPushNotificationService(
        HttpClient httpClient,
        ILogger<ExpoPushNotificationService> logger,
        PushDeviceStore store)
    {
        _httpClient = httpClient;
        _logger = logger;
        _store = store;
    }

    public async Task RegisterDeviceAsync(int userId, string token)
    {
        var normalized = NormalizeToken(token);
        if (string.IsNullOrWhiteSpace(normalized))
            return;

        await _store.UpsertAsync(userId, normalized);
    }

    public async Task UnregisterDeviceAsync(string token, int? userId = null)
    {
        var normalized = NormalizeToken(token);
        if (string.IsNullOrWhiteSpace(normalized))
            return;

        await _store.RemoveAsync(normalized, userId);
    }

    public async Task SendToFamilyExceptAsync(int excludedUserId, string title, string body, object? data = null)
    {
        var tokens = await _store.GetFamilyTokensExceptAsync(excludedUserId);
        await SendAsync(tokens, title, body, data);
    }

    public async Task SendToUsersAsync(IEnumerable<int> userIds, string title, string body, object? data = null)
    {
        var tokens = await _store.GetTokensByUsersAsync(userIds);
        await SendAsync(tokens, title, body, data);
    }

    private async Task SendAsync(IEnumerable<string> tokens, string title, string body, object? data)
    {
        var uniqueTokens = tokens
            .Select(NormalizeToken)
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (uniqueTokens.Count == 0)
            return;

        var payload = uniqueTokens.Select(token => new
        {
            to = token,
            title,
            body,
            sound = "default",
            priority = "high",
            data
        }).ToList();

        try
        {
            using var response = await _httpClient.PostAsJsonAsync(ExpoPushUri, payload);
            if (!response.IsSuccessStatusCode)
            {
                var responseText = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Expo push request failed: {StatusCode} - {Body}", response.StatusCode, responseText);
                return;
            }

            var raw = await response.Content.ReadAsStringAsync();
            if (raw.Contains("\"status\":\"error\"", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Expo push returned errors: {Payload}", raw);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send Expo push notifications");
        }
    }

    private static string NormalizeToken(string token)
    {
        var trimmed = token?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmed))
            return string.Empty;
        if (!trimmed.StartsWith("ExponentPushToken[", StringComparison.Ordinal))
            return string.Empty;

        return trimmed;
    }
}

public sealed class PushDeviceStore
{
    private readonly string _filePath;
    private readonly ILogger<PushDeviceStore> _logger;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private List<PushDeviceEntry>? _cache;

    public PushDeviceStore(IConfiguration configuration, ILogger<PushDeviceStore> logger)
    {
        _logger = logger;
        _filePath = configuration["Push:StorePath"]
            ?? Environment.GetEnvironmentVariable("EIXO_PUSH_STORE_PATH")
            ?? "/app/push-devices.json";
    }

    public async Task UpsertAsync(int userId, string token)
    {
        await _lock.WaitAsync();
        try
        {
            var devices = await LoadAsync();
            var existing = devices.FirstOrDefault(x => x.Token == token);
            if (existing is null)
            {
                devices.Add(new PushDeviceEntry
                {
                    Token = token,
                    UserId = userId,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                existing.UserId = userId;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            await SaveAsync(devices);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task RemoveAsync(string token, int? userId = null)
    {
        await _lock.WaitAsync();
        try
        {
            var devices = await LoadAsync();
            devices = devices
                .Where(x => x.Token != token || (userId.HasValue && x.UserId != userId.Value))
                .ToList();
            await SaveAsync(devices);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<IReadOnlyList<string>> GetFamilyTokensExceptAsync(int excludedUserId)
    {
        await _lock.WaitAsync();
        try
        {
            var devices = await LoadAsync();
            return devices
                .Where(x => x.UserId != excludedUserId)
                .Select(x => x.Token)
                .Distinct(StringComparer.Ordinal)
                .ToList();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<IReadOnlyList<string>> GetTokensByUsersAsync(IEnumerable<int> userIds)
    {
        var targetUsers = userIds.Distinct().ToHashSet();
        if (targetUsers.Count == 0)
            return [];

        await _lock.WaitAsync();
        try
        {
            var devices = await LoadAsync();
            return devices
                .Where(x => targetUsers.Contains(x.UserId))
                .Select(x => x.Token)
                .Distinct(StringComparer.Ordinal)
                .ToList();
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<List<PushDeviceEntry>> LoadAsync()
    {
        if (_cache is not null)
            return _cache;

        if (!File.Exists(_filePath))
        {
            _cache = [];
            return _cache;
        }

        try
        {
            var json = await File.ReadAllTextAsync(_filePath);
            _cache = JsonSerializer.Deserialize<List<PushDeviceEntry>>(json) ?? [];
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load push device store from {Path}", _filePath);
            _cache = [];
        }

        return _cache;
    }

    private async Task SaveAsync(List<PushDeviceEntry> devices)
    {
        _cache = devices;
        var directory = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(devices);
        await File.WriteAllTextAsync(_filePath, json);
    }

    private sealed class PushDeviceEntry
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
