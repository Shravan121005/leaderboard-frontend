import React from "react";
import { Trophy } from "lucide-react";

/**
 * Leaderboard component to display user rankings.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.leaderboard - List of ranked user data.
 */
function Leaderboard({ leaderboard }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-300 mb-6 flex items-center justify-center gap-3">
        <Trophy className="text-yellow-500" size={32} /> Leaderboard
      </h2>
      {leaderboard.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No users on the leaderboard yet. Add some users and claim points!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg"
                >
                  Total Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {user.totalPoints || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
