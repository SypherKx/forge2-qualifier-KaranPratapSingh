import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, CheckCircle2, BarChart3 } from 'lucide-react';

// Modular UI Components
import BoardHeader from '../components/BoardHeader';
import KanbanColumn from '../components/KanbanColumn';
import CardModal from '../components/CardModal';
import BoardModal from '../components/BoardModal';
import ColumnModal from '../components/ColumnModal';
import MemberModal from '../components/MemberModal';
import ActivityDrawer from '../components/ActivityDrawer';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Offline LocalStorage Database Fallback Engine
const localDB = {
  getBoards: () => {
    const boards = JSON.parse(localStorage.getItem('agile_boards') || '[]');
    if (boards.length === 0) {
      const defaultBoards = [{ id: 101, name: 'Project Alpha', lists_count: 3 }];
      localStorage.setItem('agile_boards', JSON.stringify(defaultBoards));
      return defaultBoards;
    }
    return boards;
  },
  saveBoards: (boards) => {
    localStorage.setItem('agile_boards', JSON.stringify(boards));
  },
  getBoardDetails: (id) => {
    let details = JSON.parse(localStorage.getItem(`agile_board_details_${id}`) || 'null');
    if (details && details.lists) {
      details.lists = details.lists.map(list => ({
        ...list,
        cards: (list.cards || []).filter(c => 
          c.title !== 'Scaffold backend API' && 
          c.title !== 'Integrate Slack channels' && 
          c.title !== 'Build React dashboard UI' && 
          c.title !== 'Setup project repo'
        )
      }));
    }
    if (!details && id === 101) {
      details = {
        id: 101,
        name: 'Project Alpha',
        lists: [
          { id: 201, board_id: 101, name: 'To Do', position: 1, cards: [] },
          { id: 202, board_id: 101, name: 'In Progress', position: 2, cards: [] },
          { id: 203, board_id: 101, name: 'Done', position: 3, cards: [] }
        ]
      };
      localStorage.setItem(`agile_board_details_101`, JSON.stringify(details));
    }
    return details;
  },
  saveBoardDetails: (id, details) => {
    localStorage.setItem(`agile_board_details_${id}`, JSON.stringify(details));
  },
  getMembers: () => {
    const members = JSON.parse(localStorage.getItem('agile_members') || '[]');
    if (members.length === 0) {
      const defaultMembers = [
        { id: 1, name: 'Amit Sharma', email: 'amit@example.com', avatar_color: '#4F46E5' },
        { id: 2, name: 'Priya Patel', email: 'priya@example.com', avatar_color: '#10B981' },
        { id: 3, name: 'Rohan Sen', email: 'rohan@example.com', avatar_color: '#F59E0B' },
        { id: 4, name: 'Neha Gupta', email: 'neha@example.com', avatar_color: '#EF4444' }
      ];
      localStorage.setItem('agile_members', JSON.stringify(defaultMembers));
      return defaultMembers;
    }
    return members;
  },
  saveMembers: (members) => {
    localStorage.setItem('agile_members', JSON.stringify(members));
  },
  getTags: () => {
    const tags = JSON.parse(localStorage.getItem('agile_tags') || '[]');
    if (tags.length === 0) {
      const defaultTags = [
        { id: 1, name: 'Bug', color: '#EF4444' },
        { id: 2, name: 'Feature', color: '#10B981' },
        { id: 3, name: 'Design', color: '#3B82F6' },
        { id: 4, name: 'Urgent', color: '#F59E0B' }
      ];
      localStorage.setItem('agile_tags', JSON.stringify(defaultTags));
      return defaultTags;
    }
    return tags;
  },
  saveTags: (tags) => {
    localStorage.setItem('agile_tags', JSON.stringify(tags));
  },
  getActivities: () => {
    let act = JSON.parse(localStorage.getItem('agile_activities') || '[]');
    act = act.filter(a => !a.text?.includes('Scaffold') && !a.text?.includes('Slack') && !a.text?.includes('React dashboard') && !a.text?.includes('Setup project repo'));
    if (act.length === 0) {
      const defaultAct = [
        { id: 1, user: 'System Bot', text: 'workspace initialized', time: 'Just now', type: 'system' }
      ];
      localStorage.setItem('agile_activities', JSON.stringify(defaultAct));
      return defaultAct;
    }
    return act;
  },
  saveActivities: (activities) => {
    localStorage.setItem('agile_activities', JSON.stringify(activities));
  }
};

export default function Board() {
  const navigate = useNavigate();
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('dark-mode', darkMode);
  }, [darkMode]);

  // Core Data States
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boardDetails, setBoardDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Activities & Drawer State
  const [activities, setActivities] = useState([]);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [newActivityNote, setNewActivityNote] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  // Modal Visibility States
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardListId, setCardListId] = useState(null);
  const [cardForm, setCardForm] = useState({ title: '', description: '', due_date: '', member_id: '', tags: [] });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', avatar_color: '#f54e00' });
  const [showBriefModal, setShowBriefModal] = useState(false);

  const addActivity = (user, text, type = 'user') => {
    const newEntry = { id: Date.now(), user: user || 'Team Member', text, time: 'Just now', type };
    const updated = [newEntry, ...activities];
    setActivities(updated);
    localDB.saveActivities(updated);
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${API_BASE}/boards`, { signal: AbortSignal.timeout(1000) });
        if (res.ok) setUseLocalStorage(false);
        else setUseLocalStorage(true);
      } catch (err) {
        setUseLocalStorage(true);
      }
    };
    checkConnection();
    setActivities(localDB.getActivities());
  }, []);

  useEffect(() => {
    fetchBoards();
    fetchMembers();
    fetchTags();
  }, [useLocalStorage]);

  useEffect(() => {
    if (selectedBoardId) {
      fetchBoardDetails(selectedBoardId);
    } else {
      setBoardDetails(null);
    }
  }, [selectedBoardId, useLocalStorage]);

  const fetchBoards = async () => {
    try {
      if (useLocalStorage) {
        const data = localDB.getBoards();
        setBoards(data);
        if (data.length > 0 && !selectedBoardId) setSelectedBoardId(data[0].id);
        return;
      }
      const res = await fetch(`${API_BASE}/boards`);
      const data = await res.json();
      setBoards(data);
      if (data.length > 0 && !selectedBoardId) setSelectedBoardId(data[0].id);
    } catch (err) {
      setUseLocalStorage(true);
    }
  };

  const fetchBoardDetails = async (id) => {
    setLoading(true);
    try {
      if (useLocalStorage) {
        setBoardDetails(localDB.getBoardDetails(id));
        return;
      }
      const res = await fetch(`${API_BASE}/boards/${id}`);
      const data = await res.json();
      setBoardDetails(data);
    } catch (err) {
      setBoardDetails(localDB.getBoardDetails(id));
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      if (useLocalStorage) {
        setMembers(localDB.getMembers());
        return;
      }
      const res = await fetch(`${API_BASE}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setMembers(localDB.getMembers());
    }
  };

  const fetchTags = async () => {
    try {
      if (useLocalStorage) {
        setTags(localDB.getTags());
        return;
      }
      const res = await fetch(`${API_BASE}/tags`);
      const data = await res.json();
      setTags(data);
    } catch (err) {
      setTags(localDB.getTags());
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      if (useLocalStorage) {
        const boardId = 101;
        const newBoard = { id: boardId, name: 'Project Alpha', lists_count: 3 };
        const boardsList = localDB.getBoards().filter(b => b.id !== boardId);
        boardsList.push(newBoard);
        localDB.saveBoards(boardsList);

        const alphaDetails = {
          id: boardId,
          name: 'Project Alpha',
          lists: [
            { id: 201, board_id: boardId, name: 'To Do', position: 1, cards: [] },
            { id: 202, board_id: boardId, name: 'In Progress', position: 2, cards: [] },
            { id: 203, board_id: boardId, name: 'Done', position: 3, cards: [] }
          ]
        };

        localDB.saveBoardDetails(boardId, alphaDetails);
        setBoards(boardsList);
        setSelectedBoardId(boardId);
        addActivity('System Bot', 'initialized workspace Project Alpha', 'system');
        setSeeding(false);
        return;
      }

      await fetch(`${API_BASE}/seed-demo`, { method: 'POST' });
      await fetchBoards();
      await fetchMembers();
      await fetchTags();
      addActivity('System Bot', 'seeded demo workspace', 'system');
    } catch (err) {
      setUseLocalStorage(true);
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    try {
      if (useLocalStorage) {
        const boardId = Date.now();
        const newBoard = { id: boardId, name: newBoardName, lists_count: 3 };
        const boardsList = localDB.getBoards();
        boardsList.push(newBoard);
        localDB.saveBoards(boardsList);

        const newBoardDetails = {
          id: boardId,
          name: newBoardName,
          lists: [
            { id: Date.now() + 1, board_id: boardId, name: 'To Do', position: 1, cards: [] },
            { id: Date.now() + 2, board_id: boardId, name: 'In Progress', position: 2, cards: [] },
            { id: Date.now() + 3, board_id: boardId, name: 'Done', position: 3, cards: [] }
          ]
        };
        localDB.saveBoardDetails(boardId, newBoardDetails);
        setBoards(boardsList);
        setSelectedBoardId(boardId);
        setNewBoardName('');
        setShowBoardModal(false);
        addActivity('Workspace Lead', `created new board "${newBoardName}"`, 'create');
        return;
      }

      const res = await fetch(`${API_BASE}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName })
      });
      const data = await res.json();
      await fetchBoards();
      setSelectedBoardId(data.id);
      setNewBoardName('');
      setShowBoardModal(false);
      addActivity('Workspace Lead', `created board "${newBoardName}"`, 'create');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      if (useLocalStorage) {
        const details = localDB.getBoardDetails(selectedBoardId);
        const newList = {
          id: Date.now(),
          board_id: selectedBoardId,
          name: newListName,
          position: details.lists ? details.lists.length + 1 : 1,
          cards: []
        };
        details.lists = details.lists || [];
        details.lists.push(newList);
        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        setNewListName('');
        setShowListModal(false);
        addActivity('Workspace Lead', `added column "${newListName}"`, 'create');
        return;
      }

      await fetch(`${API_BASE}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName, board_id: selectedBoardId })
      });
      fetchBoardDetails(selectedBoardId);
      setNewListName('');
      setShowListModal(false);
      addActivity('Workspace Lead', `added column "${newListName}"`, 'create');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!id || !window.confirm("Delete this board?")) return;
    try {
      if (useLocalStorage) {
        const boardsList = localDB.getBoards().filter(b => b.id !== id);
        localDB.saveBoards(boardsList);
        localStorage.removeItem(`agile_board_details_${id}`);
        setBoards(boardsList);
        setSelectedBoardId(boardsList.length > 0 ? boardsList[0].id : null);
        addActivity('Workspace Lead', 'deleted board', 'delete');
        return;
      }
      await fetch(`${API_BASE}/boards/${id}`, { method: 'DELETE' });
      const remaining = boards.filter(b => b.id !== id);
      setBoards(remaining);
      setSelectedBoardId(remaining.length > 0 ? remaining[0].id : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Delete swimlane column?")) return;
    try {
      if (useLocalStorage) {
        const details = localDB.getBoardDetails(selectedBoardId);
        details.lists = details.lists.filter(l => l.id !== listId);
        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        return;
      }
      await fetch(`${API_BASE}/lists/${listId}`, { method: 'DELETE' });
      fetchBoardDetails(selectedBoardId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCard = async () => {
    try {
      if (useLocalStorage) {
        const details = localDB.getBoardDetails(selectedBoardId);
        const cardTags = tags.filter(t => (cardForm.tags || []).includes(t.id));
        const cardMember = members.find(m => (cardForm.members || []).includes(m.id)) || null;

        if (selectedCard) {
          details.lists = details.lists.map(lst => {
            if (lst.cards && lst.cards.some(c => c.id === selectedCard.id)) {
              lst.cards = lst.cards.map(c => c.id === selectedCard.id ? { ...c, ...cardForm, tags: cardTags, member: cardMember } : c);
            }
            return lst;
          });
        } else {
          const newCard = { id: Date.now(), board_list_id: cardListId, ...cardForm, tags: cardTags, member: cardMember };
          details.lists = details.lists.map(lst => {
            if (lst.id === cardListId) {
              lst.cards = lst.cards || [];
              lst.cards.push(newCard);
            }
            return lst;
          });
        }
        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        setShowCardModal(false);
        return;
      }

      const url = selectedCard ? `${API_BASE}/cards/${selectedCard.id}` : `${API_BASE}/cards`;
      await fetch(url, {
        method: selectedCard ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cardForm, board_list_id: cardListId })
      });
      fetchBoardDetails(selectedBoardId);
      setShowCardModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Delete card?")) return;
    try {
      if (useLocalStorage) {
        const details = localDB.getBoardDetails(selectedBoardId);
        details.lists = details.lists.map(lst => ({
          ...lst,
          cards: (lst.cards || []).filter(c => c.id !== cardId)
        }));
        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        setShowCardModal(false);
        return;
      }
      await fetch(`${API_BASE}/cards/${cardId}`, { method: 'DELETE' });
      fetchBoardDetails(selectedBoardId);
      setShowCardModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    try {
      const rawData = e.dataTransfer.getData('text/plain');
      if (!rawData) return;
      const { cardId } = JSON.parse(rawData);
      
      const details = localDB.getBoardDetails(selectedBoardId) || boardDetails;
      let cardToMove = null;
      details.lists = details.lists.map(lst => {
        if (lst.cards && lst.cards.some(c => c.id === cardId)) {
          cardToMove = lst.cards.find(c => c.id === cardId);
          lst.cards = lst.cards.filter(c => c.id !== cardId);
        }
        return lst;
      });

      if (cardToMove) {
        cardToMove.board_list_id = targetListId;
        details.lists = details.lists.map(lst => {
          if (lst.id === targetListId) {
            lst.cards = lst.cards || [];
            lst.cards.push(cardToMove);
          }
          return lst;
        });
      }

      if (useLocalStorage) {
        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        return;
      }

      setBoardDetails(details);
      await fetch(`${API_BASE}/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_list_id: targetListId, position: 1 })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditCard = (card) => {
    setSelectedCard(card);
    setCardForm({
      title: card.title,
      description: card.description || '',
      due_date: card.due_date ? card.due_date.substring(0, 10) : '',
      list_id: card.board_list_id,
      tags: card.tags ? card.tags.map(t => typeof t === 'object' ? t.id : t) : [],
      members: card.members ? card.members.map(m => typeof m === 'object' ? m.id : m) : []
    });
    setShowCardModal(true);
  };

  const handleOpenCreateCard = (listId) => {
    setSelectedCard(null);
    setCardListId(listId);
    setCardForm({
      title: '',
      description: '',
      due_date: '',
      list_id: listId,
      tags: [],
      members: []
    });
    setShowCardModal(true);
  };

  // Filter Cards Logic
  const getFilteredCards = (cards = []) => {
    return cards.filter(c => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description && c.description.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      if (selectedTagFilter) {
        const cardTagIds = c.tags ? c.tags.map(t => typeof t === 'object' ? t.id : t) : [];
        if (!cardTagIds.includes(Number(selectedTagFilter))) return false;
      }
      if (selectedMemberFilter) {
        const cardMemberIds = c.members ? c.members.map(m => typeof m === 'object' ? m.id : m) : [];
        if (!cardMemberIds.includes(Number(selectedMemberFilter))) return false;
      }
      if (filterOverdueOnly) {
        if (!c.due_date || new Date(c.due_date) >= new Date()) return false;
      }
      return true;
    });
  };

  return (
    <div className="kanban-app">
      {/* Header Bar Component */}
      <BoardHeader
        boards={boards}
        selectedBoardId={selectedBoardId}
        onSelectBoard={(id) => setSelectedBoardId(id)}
        onOpenBoardModal={() => setShowBoardModal(true)}
        onOpenListModal={() => setShowListModal(true)}
        onSeedDemo={handleSeedDemo}
        seeding={seeding}
        onToggleActivityDrawer={() => setShowActivityDrawer(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTagFilter={selectedTagFilter}
        setSelectedTagFilter={setSelectedTagFilter}
        selectedMemberFilter={selectedMemberFilter}
        setSelectedMemberFilter={setSelectedMemberFilter}
        filterOverdueOnly={filterOverdueOnly}
        setFilterOverdueOnly={setFilterOverdueOnly}
        tags={tags}
        members={members}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onDeleteBoard={handleDeleteBoard}
      />

      {/* Main Board Workspace Area */}
      <main className="dashboard-container">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading swimlanes...
          </div>
        ) : boardDetails && boardDetails.lists ? (
          <div className="board-canvas">
            {boardDetails.lists.map(list => {
              const filteredCards = getFilteredCards(list.cards || []);
              return (
                <KanbanColumn
                  key={list.id}
                  list={{ ...list, cards: filteredCards }}
                  tags={tags}
                  members={members}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onCardClick={handleOpenEditCard}
                  onDeleteList={handleDeleteList}
                  onAddCardClick={handleOpenCreateCard}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle2 size={48} style={{ color: 'var(--accent-primary)' }} />
            <h2>No Active Kanban Board Selected</h2>
            <p>Click "Seed Demo Board" or "New Board" above to start orchestrating tasks.</p>
            <button className="btn btn-primary" onClick={handleSeedDemo} disabled={seeding}>
              🚀 Seed Demo Board
            </button>
          </div>
        )}
      </main>

      {/* Modal Dialog Components */}
      <BoardModal
        isOpen={showBoardModal}
        boardName={newBoardName}
        setBoardName={setNewBoardName}
        onClose={() => setShowBoardModal(false)}
        onSubmit={handleCreateBoard}
      />

      <ColumnModal
        isOpen={showListModal}
        listName={newListName}
        setListName={setNewListName}
        onClose={() => setShowListModal(false)}
        onSubmit={handleCreateList}
      />

      <CardModal
        isOpen={showCardModal}
        editingCard={selectedCard}
        cardForm={cardForm}
        setCardForm={setCardForm}
        lists={boardDetails ? boardDetails.lists || [] : []}
        tags={tags}
        members={members}
        onClose={() => setShowCardModal(false)}
        onSubmit={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <MemberModal
        isOpen={showMemberModal}
        memberForm={memberForm}
        setMemberForm={setMemberForm}
        onClose={() => setShowMemberModal(false)}
        onSubmit={() => {
          const membersList = localDB.getMembers();
          membersList.push({ id: Date.now(), ...memberForm });
          localDB.saveMembers(membersList);
          setMembers(membersList);
          setShowMemberModal(false);
        }}
      />

      <ActivityDrawer
        isOpen={showActivityDrawer}
        onClose={() => setShowActivityDrawer(false)}
        activities={activities}
        filter={activityFilter}
        setFilter={setActivityFilter}
        newNote={newActivityNote}
        setNewNote={setNewActivityNote}
        onAddNote={() => {
          if (!newActivityNote.trim()) return;
          addActivity('You (Lead)', newActivityNote.trim(), 'comment');
          setNewActivityNote('');
        }}
      />
    </div>
  );
}
