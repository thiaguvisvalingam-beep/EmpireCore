import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function StarterScreen({ session, chosenPillars, onComplete }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  function togglePillar(id) {
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(p => p !== id));
    } else if (selected.length < 3) {
      setSelected(prev => [...prev, id]);
    }
  }

  async function handleActivate() {
    if (selected.length < 2 || saving) return;

    setSaving(true);

    const { error } = await supabase
      .from('user_pillars')
      .update({ is_active: true, is_unlocked: true, unlocked_at: new Date().toISOString() })
      .eq('user_id', session.user.id)
      .in('pillar_id', selected);

    if (error) {
      console.log('Error activating pillars:', error.message);
      setSaving(false);
    } else {
      onComplete();
    }
  }

  const isAtLimit = selected.length >= 3;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activate Your Foundation</Text>
      <Text style={styles.subtitle}>
        Which 2 or 3 pillars do you want to start with?{'\n'}
        The strongest empires are built one foundation at a time.{'\n'}
        The rest stay in your library — ready when you are.
      </Text>

      <FlatList
        data={chosenPillars}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          const isDisabled = isAtLimit && !isSelected;

          return (
            <TouchableOpacity
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isDisabled && styles.cardDisabled,
              ]}
              onPress={() => togglePillar(item.id)}
              disabled={isDisabled}
            >
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                {item.name}
              </Text>
              {isSelected && (
                <Text style={styles.activeTag}>ACTIVATING</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <Text style={styles.counter}>
        {selected.length === 0
          ? 'Select 2 or 3 pillars to activate'
          : selected.length === 1
          ? 'Select 1 or 2 more'
          : selected.length === 2
          ? 'Good — or add one more'
          : 'Maximum selected'}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          (selected.length < 2 || saving) && styles.buttonDisabled,
        ]}
        onPress={handleActivate}
        disabled={selected.length < 2 || saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Activating...' : 'Activate My Empire'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888888',
    lineHeight: 24,
    marginBottom: 24,
  },
  grid: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    margin: 6,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardSelected: {
    backgroundColor: '#1a1a2e',
    borderColor: '#4f46e5',
  },
  cardDisabled: {
    opacity: 0.35,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: '#818cf8',
  },
  activeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: 1,
    marginTop: 4,
  },
  counter: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: '#2a2a2a',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
