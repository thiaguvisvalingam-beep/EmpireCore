import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function OnboardingScreen({ session }) {
  const [pillars, setPillars] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchPillars() {
      const { data, error } = await supabase
        .from('pillar_definitions')
        .select('*')
        .order('sort_order');

      if (error) {
        console.log('Error fetching pillars:', error.message);
      } else {
        setPillars(data);
      }
      setLoading(false);
    }

    fetchPillars();
  }, []);

  function togglePillar(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleContinue() {
    if (selected.length === 0 || saving || saved) return;

    setSaving(true);

    const rows = selected.map((pillarId, index) => ({
      user_id: session.user.id,
      pillar_id: pillarId,
      is_active: false,
      is_unlocked: false,
      position: index,
    }));

    const { error } = await supabase.from('user_pillars').insert(rows);

    if (error) {
      console.log('Error saving pillars:', error.message);
      setSaving(false);
    } else {
      setSaved(true);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Pillars</Text>
      <Text style={styles.subtitle}>
        Select the areas of life you want to build your empire around.
      </Text>

      <FlatList
        data={pillars}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => togglePillar(item.id)}
            >
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                {item.name}
              </Text>
              <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (selected.length === 0 || saving || saved) && styles.buttonDisabled,
        ]}
        onPress={handleContinue}
        disabled={selected.length === 0 || saving || saved}
      >
        <Text style={styles.buttonText}>
          {saved
            ? 'Pillars saved — home screen coming soon'
            : saving
            ? 'Saving...'
            : selected.length === 0
            ? 'Select at least one pillar'
            : `Continue with ${selected.length} pillar${selected.length > 1 ? 's' : ''}`}
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
  center: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
  },
  grid: {
    paddingBottom: 24,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  cardTitleSelected: {
    color: '#818cf8',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  cardDescriptionSelected: {
    color: '#a5b4fc',
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
