import React from "react";
import { User, PlusCircle, ChevronDown } from "lucide-react";

/**
 * Dropdown component for user selection and adding new users.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.users - List of available users.
 * @param {string} props.selectedUserId - ID of the currently selected user.
 * @param {string} props.selectedUserName - Name of the currently selected user.
 * @param {string} props.newUserName - Value of the new user input field.
 * @param {string} props.errorMessage - Error message to display.
 * @param {function} props.handleAddUser - Function to handle adding a new user.
 * @param {function} props.handleSelectUser - Function to handle selecting a user.
 * @param {function} props.setNewUserName - Function to update the new user input.
 * @param {boolean} props.isDropdownOpen - Controls dropdown visibility.
 * @param {function} props.setIsDropdownOpen - Function to toggle dropdown visibility.
 * @param {React.RefObject} props.dropdownRef - Ref for click-outside detection.
 */
function Dropdown({
  users,
  selectedUserId,
  selectedUserName,
  newUserName,
  errorMessage,
  handleAddUser,
  handleSelectUser,
  setNewUserName,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
}) {
  return (
    <div className="relative w-full max-w-sm mx-auto" ref={dropdownRef}>
      {/* Button to toggle dropdown visibility */}
      <button
        type="button"
        className="flex items-center justify-between w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm cursor-pointer transition-all duration-200 hover:border-indigo-400"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
      >
        <span className="flex items-center gap-2">
          <User className="text-indigo-500 dark:text-indigo-300" size={20} />
          {selectedUserName}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown list container */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Input and button for adding new users */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Add new user name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddUser}
              className="flex items-center justify-center w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm transition duration-300 ease-in-out transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <PlusCircle className="mr-2" size={18} /> Add User
            </button>
          </div>

          {/* List of selectable users */}
          {users.length === 0 ? (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              No users available. Add one!
            </div>
          ) : (
            <ul role="listbox" className="py-1">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2"
                  onClick={() => handleSelectUser(user)}
                  role="option"
                  aria-selected={selectedUserId === user.id}
                >
                  <User className="text-gray-400" size={16} />
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
