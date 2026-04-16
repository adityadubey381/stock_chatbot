import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type User } from '../context/AuthContext';

const UserProfileHeader = () => {
  const { user, logout, addAccount } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & accessibility states
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuItems = [
    { label: 'Add another account', action: 'add-account' },
    { divider: true },
    { label: 'Upgrade plan', action: '/billing' },
    { label: 'Personalization', action: '/settings/personalization' },
    { label: 'Profile', action: '/profile' },
    { label: 'Settings', action: '/settings' },
    { divider: true },
    { label: 'Help', action: '/help' },
    { label: 'Log out', action: 'logout' },
  ];

  const clickableItems = menuItems.filter(item => !item.divider);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility for Focus & Escape
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleAction = (action: string) => {
    setIsOpen(false);
    
    switch(action) {
      case 'logout':
        logout();
        navigate('/login');
        break;
      case 'add-account':
        // Implementation for multiple accounts:
        // You would typically open a modal here, but for demonstration:
        const dummyNewUser: User = {
          id: `user-${Date.now()}`,
          name: 'New Collaborator',
          email: 'collab@example.com',
          plan: 'Team Plan'
        };
        addAccount(dummyNewUser);
        alert('Added a new dummy account for this session context.');
        break;
      default:
        // Any route string
        if (action.startsWith('/')) {
          navigate(action);
        }
        break;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < clickableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : clickableItems.length - 1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleAction(clickableItems[focusedIndex].action!);
    }
  };

  // Guard if user is somehow null
  if (!user) return null;

  return (
    <div className="user-profile-wrapper">
      {isOpen && (
        <div 
          className="user-profile-dropdown" 
          ref={dropdownRef}
          role="menu"
          aria-label="User settings"
          onKeyDown={handleKeyDown}
        >
          <div className="dropdown-header">
            <div className="avatar-circle small">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-plan">{user.plan}</span>
            </div>
          </div>
          
          <button 
            className={`dropdown-item ${focusedIndex === 0 ? 'focused' : ''}`}
            onClick={() => handleAction('add-account')}
            role="menuitem"
            onMouseEnter={() => setFocusedIndex(0)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add another account
          </button>
          
          <div className="dropdown-divider" role="separator"></div>
          
          <button 
            className={`dropdown-item ${focusedIndex === 1 ? 'focused' : ''}`}
            onClick={() => handleAction('/billing')}
            role="menuitem"
            onMouseEnter={() => setFocusedIndex(1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            Upgrade plan
          </button>
          
          <button 
            className={`dropdown-item ${focusedIndex === 2 ? 'focused' : ''}`} 
            onClick={() => handleAction('/settings/personalization')}
            role="menuitem"
            onMouseEnter={() => setFocusedIndex(2)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            Personalization
          </button>
          
          <button 
            className={`dropdown-item ${focusedIndex === 3 ? 'focused' : ''}`} 
            onClick={() => handleAction('/profile')}
            role="menuitem"
            onMouseEnter={() => setFocusedIndex(3)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </button>
          
          <button 
            className={`dropdown-item ${focusedIndex === 4 ? 'focused' : ''}`} 
            onClick={() => handleAction('/settings')}
            role="menuitem"
            onMouseEnter={() => setFocusedIndex(4)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </button>
          
          <div className="dropdown-divider" role="separator"></div>
          
          <button 
            className={`dropdown-item justify-between ${focusedIndex === 5 ? 'focused' : ''}`}
            onClick={() => handleAction('/help')}
            role="menuitem"
            onMouseEnter={() => setFocusedIndex(5)}
          >
            <span className="flex-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Help
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
          </button>
          
          <button 
            className={`dropdown-item ${focusedIndex === 6 ? 'focused' : ''}`} 
            onClick={() => handleAction('logout')}
            role="menuitem"
            onMouseEnter={() => setFocusedIndex(6)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Log out
          </button>
        </div>
      )}

      <div 
        className="user-profile-header interactive" 
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        ref={buttonRef}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="user-info-section">
          <div className="avatar-circle">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <span>{getInitials(user.name)}</span>
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-plan">{user.plan}</span>
          </div>
        </div>
        <div className="more-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
