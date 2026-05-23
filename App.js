import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from './lib/supabase';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import StarterScreen from './screens/StarterScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('onboarding');
  const [chosenPillars, setChosenPillars] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (screen === 'onboarding') {
    return (
      <OnboardingScreen
        session={session}
        onComplete={(pillars) => {
          setChosenPillars(pillars);
          setScreen('starter');
        }}
      />
    );
  }

  if (screen === 'starter') {
    return (
      <StarterScreen
        session={session}
        chosenPillars={chosenPillars}
        onComplete={() => setScreen('home')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Empire starts here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
  },
});
