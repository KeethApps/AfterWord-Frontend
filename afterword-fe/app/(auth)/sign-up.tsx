import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { supabase } from "../../lib/supabase";
import { Colors, Fonts, Spacing, Radius, Shadows } from "../../constants/theme";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignUp() {
    if (!email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If the user is immediately confirmed (e.g., email confirmation disabled)
    if (data.session) {
      // Auth state change will handle redirect
      return;
    }

    // Otherwise show "check your email" message
    setSuccess(true);
  }

  if (success) {
    return (
      <View style={[styles.root, styles.successRoot]}>
        <View style={[styles.successCard, { marginTop: insets.top + 60 }]}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-open-outline" size={40} color={Colors.forest} />
          </View>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successBody}>
            We sent a confirmation link to{"\n"}
            <Text style={styles.successEmail}>{email}</Text>
          </Text>
          <Text style={styles.successHint}>
            Click the link in the email to activate your account, then come back to sign in.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed, { marginTop: Spacing.s32 }]}
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            <Text style={styles.primaryBtnText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
{/* Logo / Wordmark */}
<View style={styles.logoSection}>
  <Image
    source={require("../../assets/images/icon.png")}
    style={styles.logoImage}
    resizeMode="contain"
  />

  <View style={styles.logoTextContainer}>
    <Text style={styles.wordmark}>AfterWord</Text>
    <Text style={styles.tagline}>
      For the Words Worth Revisiting.
    </Text>
  </View>
</View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create and account</Text>
          <Text style={styles.cardSubtitle}>Join AfterWord - Get more out of what you read.</Text>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={Colors.slate} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.slate}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.slate} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.slate}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={Colors.slate}
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.slate} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Re-enter your password"
                placeholderTextColor={Colors.slate}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={Colors.slate}
                />
              </Pressable>
            </View>
          </View>

          {/* Create Account Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.primaryBtnPressed,
              loading && styles.primaryBtnDisabled,
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>already have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign In Link */}
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  successRoot: {
    alignItems: "center",
    paddingHorizontal: Spacing.s24,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.s24,
  },

  // Logo
logoSection: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: Spacing.s12,
  marginBottom: Spacing.s16,
},

logoImage: {
  width: 102,
  height: 102,
},

logoTextContainer: {
  justifyContent: "center",
},
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.s16,
    backgroundColor: Colors.forest,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.s16,
    ...Shadows.md,
  },
  logoEmoji: {
    fontSize: 32,
  },
  wordmark: {
    fontFamily: Fonts?.serif ?? "serif",
    fontSize: 32,
    color: Colors.forest,
    letterSpacing: 0.5,
    marginBottom: Spacing.s6,
  },
  tagline: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 12,
    color: Colors.slate,
    letterSpacing: 0.2,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.s16,
    padding: Spacing.s24,
    width: "100%",
    maxWidth: 420,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 24,
    color: Colors.black,
    marginBottom: Spacing.s4,
  },
  cardSubtitle: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 14,
    color: Colors.slate,
    marginBottom: Spacing.s24,
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    backgroundColor: "#FEF2F2",
    borderRadius: Radius.s8,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: Spacing.s12,
    marginBottom: Spacing.s16,
  },
  errorText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
  },

  // Fields
  fieldGroup: {
    marginBottom: Spacing.s16,
  },
  label: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 13,
    color: Colors.black,
    marginBottom: Spacing.s6,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.s8,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.s12,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.s8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 15,
    color: Colors.black,
    height: "100%",
    outlineStyle: "none",
  } as any,
  inputFlex: {
    flex: 1,
  },
  eyeBtn: {
    padding: Spacing.s4,
    marginLeft: Spacing.s4,
  },

  // Primary Button
  primaryBtn: {
    backgroundColor: Colors.forest,
    borderRadius: Radius.s8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.s8,
  },
  primaryBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 0.3,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.s20,
    gap: Spacing.s12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 12,
    color: Colors.slate,
  },

  // Secondary Button
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.s8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnPressed: {
    backgroundColor: Colors.mist,
  },
  secondaryBtnText: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 15,
    color: Colors.forest,
    letterSpacing: 0.2,
  },

  // Success State
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.s16,
    padding: Spacing.s32,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.mist,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.s24,
  },
  successTitle: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 26,
    color: Colors.forest,
    marginBottom: Spacing.s12,
    textAlign: "center",
  },
  successBody: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 15,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.s12,
  },
  successEmail: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    color: Colors.forest,
  },
  successHint: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 13,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.s8,
  },
});
