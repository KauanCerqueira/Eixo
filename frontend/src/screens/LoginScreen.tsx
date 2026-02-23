import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Vibration,
  Platform,
} from 'react-native';
import { 
  Plus, 
  Delete, 
  ShieldCheck, 
  ArrowLeft
} from 'lucide-react-native';
import { api } from '../services/api';
import { authService, AuthUser } from '../services/auth';
import { THEME } from '../theme';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  // State
  const [users, setUsers] = useState<Array<{ id: number; name: string; initials: string; color: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  
  // Form State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerPin, setRegisterPin] = useState('');
  const [registerPinConfirm, setRegisterPinConfirm] = useState('');
  
  // Auth State
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pinShakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUsers();
    // Entry Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Shake animation for error
  const shakePin = () => {
    Vibration.vibrate(50);
    Animated.sequence([
      Animated.timing(pinShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(pinShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(pinShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(pinShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const loadUsers = async () => {
    try {
      const usersData = await api.getUsers();
      setUsers(usersData.map(u => ({
        id: u.id,
        name: u.name,
        initials: u.initials,
        color: u.color
      })));
    } catch (err) {
      setError('Não foi possível carregar os perfis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4 && selectedUser) {
        handleLogin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(null);
  };

  const handleLogin = async (pinCode: string) => {
    if (!selectedUser) return;
    setIsLoading(true);
    setError(null);

    try {
      const user = users.find(u => u.id === selectedUser);
      if (!user) throw new Error('Usuário não encontrado');

      const result = await authService.login(user.name, pinCode);
      // Success Haptic/Feedback could go here
      onLogin(result.user!);
    } catch (err: any) {
      shakePin();
      setError(err.message || 'PIN incorreto');
      setPin('');
      setIsLoading(false); // Only set not loading on error, success unmounts
    }
  };

  const handleRegister = async () => {
    const name = registerName.trim();
    if (!name) { setError('Como devemos te chamar?'); return; }
    if (registerPin.length !== 4) { setError('O PIN precisa de 4 dígitos'); return; }
    if (registerPin !== registerPinConfirm) { setError('Os PINs não conferem'); return; }

    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(name, registerPin);
      onLogin(result.user!);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
      setIsLoading(false);
    }
  };

  // --- RENDERERS ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.logoText}>EIXO</Text>
      <Text style={styles.welcomText}>
        {isRegisterMode ? "NOVO PERFIL" : 
         selectedUser ? "BEM-VINDO," : "QUEM É VOCÊ?"}
      </Text>
    </View>
  );

  const renderUserSelection = () => (
    <View style={styles.userSelectionContainer}>
      <View style={styles.gridContainer}>
        {users.map((user, index) => (
          <TouchableOpacity
            key={user.id}
            style={[styles.userCard, { transform: [{ rotate: index % 2 === 0 ? '-1deg' : '1deg' }] }]}
            onPress={() => {
              setSelectedUser(user.id);
              setError(null);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarContainer, { backgroundColor: user.color }]}>
              <Text style={styles.avatarText}>{user.initials}</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[styles.userCard, styles.addUserCard]}
          onPress={() => {
            setIsRegisterMode(true);
            setSelectedUser(null);
            setPin('');
            setError(null);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarContainer, styles.addAvatar]}>
            <Plus color={THEME.colors.primary} size={32} strokeWidth={3} />
          </View>
          <Text style={[styles.userName, styles.addUserText]}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPinScreen = () => {
    const user = users.find(u => u.id === selectedUser);
    
    return (
      <View style={styles.pinContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setSelectedUser(null);
              setPin('');
              setError(null);
            }}
          >
            <ArrowLeft color={THEME.colors.primary} size={28} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View style={styles.selectedUserHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: user?.color }]}>
            <Text style={styles.avatarTextLarge}>{user?.initials}</Text>
          </View>
          <Text style={styles.selectedUserName}>{user?.name?.toUpperCase()}</Text>
          <Text style={styles.pinInstruction}>DIGITE SEU PIN</Text>
        </View>

        <Animated.View style={[styles.pinDotsRow, { transform: [{ translateX: pinShakeAnim }] }]}>
          {[0, 1, 2, 3].map((i) => (
            <View 
              key={i} 
              style={[
                styles.pinDot, 
                pin.length > i && styles.pinDotFilled,
                error && styles.pinDotError
              ]} 
            />
          ))}
        </Animated.View>

        {error && (
           <View style={{ backgroundColor: THEME.colors.error, padding: 8, borderRadius: 8, borderWidth: 2, marginBottom: 16 }}>
             <Text style={styles.inlineError}>{error.toUpperCase()}</Text>
           </View>
        )}

        <View style={styles.keypadContainer}>
          {[['1','2','3'], ['4','5','6'], ['7','8','9']].map((row, i) => (
            <View key={i} style={styles.keypadRow}>
              {row.map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(digit)}
                  disabled={isLoading}
                  activeOpacity={0.5}
                >
                  <Text style={styles.keyText}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.keypadRow}>
            <View style={styles.keyButtonVars} /> 
            <TouchableOpacity
              style={styles.keyButton}
              onPress={() => handleNumberPress('0')}
              disabled={isLoading}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.keyButton, styles.deleteKey]}
              onPress={handleDelete}
              disabled={isLoading || pin.length === 0}
            >
              <Delete color={THEME.colors.primary} size={28} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderRegisterScreen = () => (
    <View style={styles.formContainer}>
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setIsRegisterMode(false);
            setRegisterName('');
            setRegisterPin('');
            setRegisterPinConfirm('');
            setError(null);
          }}
        >
          <ArrowLeft color={THEME.colors.primary} size={28} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <View style={styles.formContent}>
        <View style={styles.iconHeading}>
          <View style={styles.iconBox}>
            <Plus color="#000" size={32} strokeWidth={3} />
          </View>
          <Text style={styles.formTitle}>CRIAR CONTA</Text>
        </View>
        
        <Text style={styles.formSubtitle}>
          Entre para a família e comece a organizar.
        </Text>

        <View style={styles.inputGroup}>
          <View>
             <Text style={styles.inputLabel}>COMO DEVEMOS TE CHAMAR?</Text>
             <TextInput
              style={styles.input}
              placeholder="SEU NOME"
              placeholderTextColor="#94a3b8"
              value={registerName}
              onChangeText={setRegisterName}
              autoCapitalize="words"
            />
          </View>

          <View>
             <Text style={styles.inputLabel}>CRIE UM PIN SECRETO</Text>
             <TextInput
              style={styles.input}
              placeholder="4 DÍGITOS"
              placeholderTextColor="#94a3b8"
              value={registerPin}
              onChangeText={setRegisterPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>

          <View>
             <Text style={styles.inputLabel}>CONFIRME O PIN</Text>
             <TextInput
              style={styles.input}
              placeholder="REPITA OS 4 DÍGITOS"
              placeholderTextColor="#94a3b8"
              value={registerPinConfirm}
              onChangeText={setRegisterPinConfirm}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        {error && (
           <View style={{ backgroundColor: THEME.colors.error, padding: 8, borderRadius: 8, borderWidth: 2, marginBottom: 16 }}>
             <Text style={styles.inlineError}>{error.toUpperCase()}</Text>
           </View>
        )}

        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- MAIN RENDER ---

  if (isLoading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      
      <Animated.View style={[
        styles.content, 
        { 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }] 
        }
      ]}>
        {!selectedUser && !isRegisterMode && renderHeader()}
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isRegisterMode ? renderRegisterScreen() : 
           selectedUser ? renderPinScreen() : 
           (
             <>
               {users.length === 0 ? (
                 <View style={styles.emptyStateContainer}>
                   <ShieldCheck color={THEME.colors.primary} size={64} style={{ marginBottom: 16 }} />
                   <Text style={styles.emptyStateTitle}>Bem-vindo ao Eixo</Text>
                   <Text style={styles.emptyStateText}>O app de gestão da sua casa.</Text>
                   <TouchableOpacity 
                      style={styles.primaryButton} 
                      onPress={() => setIsRegisterMode(true)}
                   >
                     <Text style={styles.primaryButtonText}>CRIAR PRIMEIRO ACESSO</Text>
                   </TouchableOpacity>
                 </View>
               ) : renderUserSelection()}
             </>
           )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  
  // Navigation
  navBar: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    marginBottom: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    // Hard shadow
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0, 
  },

  // Header
  headerContainer: {
    marginTop: height * 0.08,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900', // Heavy font
    color: THEME.colors.primary,
    letterSpacing: -2,
    marginBottom: -4,
    fontStyle: 'italic', // Slight slant adds dynamic feel
  },
  welcomText: {
    fontSize: 20,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Cards
  userSelectionContainer: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  userCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3, // Thicker border
    borderColor: '#000',
    // Hard Shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0, 
  },
  addUserCard: {
    backgroundColor: '#FDE047', // Yellow accent 
    borderStyle: 'dashed',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#000',
  },
  addAvatar: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  addUserText: {
    color: '#000',
  },

  // PIN
  pinContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  selectedUserHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  avatarTextLarge: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  selectedUserName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  pinInstruction: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 1,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 40,
    height: 30,
    alignItems: 'center',
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
  },
  pinDotFilled: {
    backgroundColor: '#000',
    transform: [{ scale: 1.1 }],
  },
  pinDotError: {
    backgroundColor: THEME.colors.error,
    borderColor: THEME.colors.error,
  },
  
  // Keypad
  keypadContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    // Hard Shadow small
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  keyButtonVars: {
      width: 80,
      height: 80,
  },
  deleteKey: {
    backgroundColor: '#FECACA', // Light red
  },
  keyText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
  },
  
  // Forms
  formContainer: {
    flex: 1,
    width: '100%',
  },
  formContent: {
    flex: 1,
    paddingTop: 0,
  },
  iconHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#A78BFA', // Purple 400
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    fontStyle: 'italic',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 32,
    fontWeight: '600',
    borderLeftWidth: 4,
    borderLeftColor: '#F472B6', // Pink border
    paddingLeft: 12,
  },
  inputGroup: {
    gap: 20,
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    height: 56,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  
  // Buttons
  primaryButton: {
    height: 60,
    backgroundColor: '#000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 }, // Big shadow
    shadowOpacity: 0.3, // Drop shadow for lift
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Errors & States
  inlineError: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '900',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
    marginTop: 40,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  emptyStateTitle: {
    fontSize: 24,
    color: '#000',
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
