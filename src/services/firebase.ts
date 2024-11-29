import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserType } from '../types/user';
import { ProjectType } from '../types/project';

// Helper function to safely convert Firestore Timestamp to ISO string
function convertTimestampToISO(timestamp: any): string | undefined {
  if (!timestamp) return undefined;
  if (timestamp.toDate instanceof Function) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toISOString();
  }
  return undefined;
}

// Helper function to convert dates to Firestore timestamps
function convertDatesToTimestamps(obj: any): any {
  if (!obj) return obj;
  
  // If it's not an object or is null, return as is
  if (typeof obj !== 'object' || obj === null) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToTimestamps(item));
  }
  
  // Create a new object to store the converted values
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      continue; // Skip undefined or null values
    }

    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      // Convert ISO date strings to Timestamps
      result[key] = Timestamp.fromDate(new Date(value));
    } else if (typeof value === 'object') {
      result[key] = convertDatesToTimestamps(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Clean object by removing undefined and null values
function cleanObject(obj: any): any {
  if (!obj) return obj;
  
  const cleaned = Object.entries(obj).reduce((acc: any, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  return cleaned;
}

export async function registerUser(email: string, password: string, userData: Omit<UserType, 'id'>) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const userDataToSave = cleanObject({
    ...userData,
    id: user.uid,
    email: user.email,
    createdAt: serverTimestamp()
  });

  await setDoc(doc(db, 'users', user.uid), userDataToSave);

  return {
    ...userData,
    id: user.uid,
    email: user.email,
  };
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  if (!userDoc.exists()) {
    throw new Error('User data not found');
  }

  const data = userDoc.data();
  return {
    ...data,
    id: userDoc.id,
    createdAt: convertTimestampToISO(data.createdAt)
  } as UserType;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getCurrentUserData(user: FirebaseUser) {
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data();
  return {
    ...data,
    id: userDoc.id,
    createdAt: convertTimestampToISO(data.createdAt)
  } as UserType;
}

export async function createProject(projectData: Omit<ProjectType, 'id'>) {
  try {
    const projectToCreate = cleanObject({
      ...projectData,
      createdAt: serverTimestamp(),
      lastUpdate: serverTimestamp(),
      date: Timestamp.fromDate(new Date(projectData.date)),
      comments: []
    });

    const docRef = await addDoc(collection(db, 'projects'), projectToCreate);
    console.log('Project created with ID:', docRef.id);
    
    return {
      ...projectToCreate,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export function subscribeToProjects(
  userId: string, 
  userType: 'videographer' | 'client',
  callback: (projects: ProjectType[]) => void
) {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    where(userType === 'videographer' ? 'videographerId' : 'clientId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestampToISO(data.createdAt),
        lastUpdate: convertTimestampToISO(data.lastUpdate),
        date: convertTimestampToISO(data.date),
        comments: (data.comments || []).map((comment: any) => ({
          ...comment,
          createdAt: convertTimestampToISO(comment.createdAt)
        }))
      } as ProjectType;
    });

    callback(projects);
  }, (error) => {
    console.error('Error subscribing to projects:', error);
    callback([]);
  });
}

export async function updateProject(projectId: string, updates: Partial<ProjectType>) {
  try {
    const projectRef = doc(db, 'projects', projectId);
    
    // Clean and convert the updates
    const cleanedUpdates = cleanObject(updates);
    const updatesWithTimestamps = convertDatesToTimestamps({
      ...cleanedUpdates,
      lastUpdate: serverTimestamp()
    });

    await updateDoc(projectRef, updatesWithTimestamps);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(projectId: string) {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

export async function getVideographers() {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('userType', '==', 'videographer'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: convertTimestampToISO(data.createdAt)
    } as UserType;
  });
}