import React, { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { Award } from "lucide-react";

// Import components
import Dropdown from './Dropdown.tsx';
import Leaderboard from './Leaderboard.tsx';

// --- Type Definitions ---
// Define the shape of a User object
interface UserData {
  id: string;
  name: string;
  totalPoints: number;
  createdAt?: any; // Firebase Timestamp type
  updatedAt?: any; // Firebase Timestamp type
}

// Define the shape of a Leaderboard entry (User with rank)
interface LeaderboardEntry extends UserData {
  rank: number;
}

// --- Firebase Initialization ---
// Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Use projectId for Firestore collection paths
const appId = firebaseConfig.projectId || "default-app-id";

// Initialize Firebase App with a specific name
let app;
try {
  app = getApp("leaderboardAppInstance");
} catch (e) {
  app = initializeApp(firebaseConfig, "leaderboardAppInstance");
}

const db = getFirestore(app);

// --- End Firebase Initialization ---

// Backend API base URL loaded from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Main App Component
function App() {
  // Use defined types for state initialization
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserName, setSelectedUserName] = useState<string>("Select a user");
  const [newUserName, setNewUserName] = useState<string>("");
  const [claimedPoints, setClaimedPoints] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null); // Specify HTMLDivElement for ref
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Fetch users and leaderboard from backend
  const fetchUsersAndLeaderboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/users?appId=${appId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LeaderboardEntry[] = await response.json(); // Cast data to expected type
      setUsers(data);
      setLeaderboard(data);

      const currentSelectedUser = data.find(u => u.id === selectedUserId);
      if (currentSelectedUser) {
          setSelectedUserName(currentSelectedUser.name);
      } else if (data.length > 0 && !selectedUserId) {
          setSelectedUserId(data[0].id);
          setSelectedUserName(data[0].name);
      } else if (data.length === 0) {
          setSelectedUserId('');
          setSelectedUserName('Select a user');
      }
    } catch (error: any) { // Catch error as 'any' or specific Error type
      console.error("Error fetching users/leaderboard:", error);
      setErrorMessage("Failed to load users/leaderboard. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  // Effect for initial data fetch and real-time updates from Firestore
  useEffect(() => {
    fetchUsersAndLeaderboard(); // Initial fetch via backend

    // Firestore listener for real-time user updates (totalPoints change)
    const usersCollectionRef = collection(db, `artifacts/${appId}/public/data/users`);
    const unsubscribeUsers = onSnapshot(usersCollectionRef, (snapshot) => {
      // Fix 1: Ensure id is correctly assigned and type casting is clear
      // Use Omit to prevent 'id' from doc.data() from conflicting with doc.id
      const usersData: UserData[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<UserData, 'id'> }));
      
      // Fix 2: Assign the result of map to a new variable
      const sortedAndRankedLeaderboard: LeaderboardEntry[] = usersData.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .map((user, index) => ({ ...user, rank: index + 1 }));
      
      setUsers(usersData);
      setLeaderboard(sortedAndRankedLeaderboard); // Use the correctly named variable
      
      const currentSelectedUser = usersData.find(u => u.id === selectedUserId);
      if (currentSelectedUser) {
          setSelectedUserName(currentSelectedUser.name);
      } else if (usersData.length === 0) {
          setSelectedUserId('');
          setSelectedUserName('Select a user');
      }
    }, (error: any) => {
      console.error("Error fetching users from Firestore listener:", error);
      setErrorMessage("Real-time user updates failed. Check Firestore rules.");
    });

    return () => {
      unsubscribeUsers();
    };
  }, [fetchUsersAndLeaderboard, selectedUserId]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Add a new user via backend API
  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      setErrorMessage("User name cannot be empty.");
      return;
    }
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName.trim(), appId: appId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newUser: UserData = await response.json();
      setNewUserName("");
      setSelectedUserId(newUser.id);
      setSelectedUserName(newUser.name);
      setIsDropdownOpen(false);
    } catch (error: any) {
      console.error("Error adding user via backend:", error);
      setErrorMessage(`Failed to add user: ${error.message}`);
    }
  };

  // Handle selecting a user from the dropdown
  const handleSelectUser = (user: UserData) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.name);
    setIsDropdownOpen(false);
  };

  // Claim points via backend API
  const handleClaimPoints = async () => {
    if (!selectedUserId) {
      setErrorMessage("Please select a user first.");
      return;
    }
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/claim-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, appId: appId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setClaimedPoints(result.pointsClaimed);
      setTimeout(() => setClaimedPoints(null), 3000);
    } catch (error: any) {
      console.error("Error claiming points via backend:", error);
      setErrorMessage(`Failed to claim points: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p className="text-lg">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-950 p-4 font-inter text-gray-900 dark:text-gray-100 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 md:p-8 space-y-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 dark:text-indigo-400 mb-8">
          Leaderboard Challenge
        </h1>

        {errorMessage && (
          <div
            className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{errorMessage}</span>
          </div>
        )}

        <Dropdown
          users={users}
          selectedUserId={selectedUserId}
          selectedUserName={selectedUserName}
          newUserName={newUserName}
          errorMessage={errorMessage}
          handleAddUser={handleAddUser}
          handleSelectUser={handleSelectUser}
          setNewUserName={setNewUserName}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          dropdownRef={dropdownRef}
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <button
            onClick={handleClaimPoints}
            disabled={!selectedUserId}
            className={`flex items-center justify-center px-8 py-4 font-bold text-lg rounded-xl shadow-lg transition duration-300 ease-in-out transform ${
              selectedUserId
                ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 focus:ring-indigo-500"
                : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
          >
            <Award className="mr-3" size={24} /> Claim Random Points
          </button>
          {claimedPoints !== null && (
            <div className="text-center text-green-600 dark:text-green-400 font-bold text-2xl animate-bounce">
              +{claimedPoints} Points!
            </div>
          )}
        </div>

        <Leaderboard leaderboard={leaderboard} />
      </div>
    </div>
  );
}

export default App;
