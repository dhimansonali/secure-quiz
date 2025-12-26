// Firestore integration hook
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export function useFirestore(collectionName, filters = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let q = collection(db, collectionName);
        
        if (filters) {
          const conditions = [];
          Object.entries(filters).forEach(([key, value]) => {
            conditions.push(where(key, '==', value));
          });
          // Note: simple single-field filter for now
          if (conditions.length > 0) {
            q = query(q, conditions[0]);
          }
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(docs);
        setError(null);
      } catch (err) {
        console.error('Firestore error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, filters]);

  return { data, loading, error };
}

export function useFirestoreListener(collectionName, callback) {
  useEffect(() => {
    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    });

    return unsubscribe;
  }, [collectionName]);
}
