export const parseFlexibleDate = (value?: string | null): Date | null => {
    if (!value || typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length >= 2) {
            const day = Number(parts[0]);
            const month = Number(parts[1]);
            const year = parts.length >= 3 ? Number(parts[2]) : new Date().getFullYear();

            if (Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)) {
                const parsed = new Date(year, month - 1, day);
                if (!Number.isNaN(parsed.getTime())) return parsed;
            }
        }
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
};

export const formatDate = (value?: string | null, locale = 'pt-BR'): string => {
    const parsed = parseFlexibleDate(value);
    if (!parsed) return '-';
    return parsed.toLocaleDateString(locale);
};

export const formatTime = (value?: string | null, locale = 'pt-BR'): string => {
    const parsed = parseFlexibleDate(value);
    if (!parsed) return '--:--';
    return parsed.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};

export const toIsoDate = (value?: string | null): string | null => {
    const parsed = parseFlexibleDate(value);
    if (!parsed) return null;

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const isSameCalendarDay = (a?: string | null, b?: string | null): boolean => {
    const da = parseFlexibleDate(a);
    const db = parseFlexibleDate(b);
    if (!da || !db) return false;

    return da.getFullYear() === db.getFullYear()
        && da.getMonth() === db.getMonth()
        && da.getDate() === db.getDate();
};
