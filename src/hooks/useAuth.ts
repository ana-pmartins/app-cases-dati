import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { AuthorizedUser } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authProfile, setAuthProfile] = useState<AuthorizedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser?.email) {
        const email = firebaseUser.email.toLowerCase();
        try {
          const userDoc = await getDoc(doc(db, "authorized_users", email));
          if (userDoc.exists()) {
            setAuthProfile(userDoc.data() as AuthorizedUser);
            setIsAuthorized(true);
          } else {
            console.warn("Usuário não autorizado:", email);
            setAuthProfile(null);
            setIsAuthorized(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setIsAuthorized(false);
        }
      } else {
        setAuthProfile(null);
        setIsAuthorized(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, authProfile, loading, isAuthorized };
}
