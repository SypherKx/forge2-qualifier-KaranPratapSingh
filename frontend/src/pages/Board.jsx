import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Calendar, User, CheckCircle2, GripVertical, 
  AlertCircle, Sun, Moon, Play, MessageSquare, Terminal, Activity, 
  Filter, Search, Sparkles, CheckSquare, ChevronLeft, ChevronRight, 
  Send, Clock, TrendingUp, BarChart3, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Mock DB Utility for Offline Mode Fallback
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
    act = act.filter(a => !a.text?.includes('Scaffold') && !a.text?.includes('Slack') && !a.text?.includes('React dashboard') && !a.text?.includes('Setup project repo') && !a.text?.includes('seeded workspace Project Alpha with 4 tasks'));
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

function Board() {
  const navigate = useNavigate();
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

  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boardDetails, setBoardDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Activities State & Drawer
  const [activities, setActivities] = useState([]);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [newActivityNote, setNewActivityNote] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  // Modal States
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardListId, setCardListId] = useState(null);
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    due_date: '',
    member_id: '',
    tags: [],
    subtasks: []
  });
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', avatar_color: '#f54e00' });

  // AI Summary Toast / Modal State
  const [showBriefModal, setShowBriefModal] = useState(false);

  // AI Agent Build Simulation States
  const [showSimModal, setShowSimModal] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const simSteps = [
    {
      channel: '#sprint-main',
      sender: 'Karan Pratap Singh (Human)',
      avatar: 'K',
      text: '🤖 @Hermes build a new board for launching our workspace, name it "AI Launchpad". Add custom swimlanes: "Specs", "Development", "Production". Assign demo tasks to the team.',
      status: 'incoming'
    },
    {
      channel: '#sprint-main',
      sender: 'Hermes (Brain)',
      avatar: 'H',
      text: 'Formulating structural blueprint. Plan: Create Board "AI Launchpad". Dispatched command to @OpenClaw to migrate schemas.',
      status: 'thinking'
    },
    {
      channel: '#agent-coder',
      sender: 'OpenClaw (Hands)',
      avatar: 'O',
      text: 'Grep checking database path configurations. WSL context OK. Initiating SQLite schema files...',
      status: 'grep'
    },
    {
      channel: '#agent-coder',
      sender: 'OpenClaw (Hands)',
      avatar: 'O',
      text: 'Generating models and migrations. Executing `touch database.sqlite && php artisan migrate`...',
      status: 'edit'
    },
    {
      channel: '#agent-log',
      sender: 'System Log',
      avatar: 'S',
      text: 'Vite bundling complete. Seeded 3 demo tasks for "AI Launchpad". Workspace synced successfully.',
      status: 'done'
    }
  ];

  const addActivity = (user, text, type = 'user') => {
    const newEntry = {
      id: Date.now(),
      user: user || 'Team Member',
      text,
      time: 'Just now',
      type
    };
    const updated = [newEntry, ...activities];
    setActivities(updated);
    localDB.saveActivities(updated);
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${API_BASE}/boards`, { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
          setUseLocalStorage(false);
        } else {
          setUseLocalStorage(true);
        }
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
        if (data.length > 0 && !selectedBoardId) {
          setSelectedBoardId(data[0].id);
        }
        return;
      }
      const res = await fetch(`${API_BASE}/boards`);
      const data = await res.json();
      setBoards(data);
      if (data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (err) {
      setUseLocalStorage(true);
    }
  };

  const fetchBoardDetails = async (id) => {
    setLoading(true);
    try {
      if (useLocalStorage) {
        const details = localDB.getBoardDetails(id);
        setBoardDetails(details);
        return;
      }
      const res = await fetch(`${API_BASE}/boards/${id}`);
      const data = await res.json();
      setBoardDetails(data);
    } catch (err) {
      const details = localDB.getBoardDetails(id);
      setBoardDetails(details);
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
        const defaultMembers = localDB.getMembers();
        const defaultTags = localDB.getTags();
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
        addActivity('System Bot', 'initialized empty workspace Project Alpha', 'system');
        setSeeding(false);
        return;
      }

      const res = await fetch(`${API_BASE}/seed-demo`, { method: 'POST' });
      await res.json();
      await fetchBoards();
      await fetchMembers();
      await fetchTags();
      addActivity('System Bot', 'seeded demo workspace', 'system');
    } catch (err) {
      console.error("Error seeding demo:", err);
      alert("Failed to connect to backend server. Reverting to Offline Mode.");
      setUseLocalStorage(true);
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
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

  const handleCreateList = async (e) => {
    e.preventDefault();
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
        addActivity('Workspace Lead', `added new column "${newListName}"`, 'create');
        return;
      }

      const res = await fetch(`${API_BASE}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName, board_id: selectedBoardId })
      });
      await res.json();
      fetchBoardDetails(selectedBoardId);
      setNewListName('');
      setShowListModal(false);
      addActivity('Workspace Lead', `added column "${newListName}"`, 'create');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBoard = async () => {
    if (!selectedBoardId || !window.confirm("Are you sure you want to delete this board and all its tasks?")) return;
    try {
      const bName = boardDetails ? boardDetails.name : 'Board';
      if (useLocalStorage) {
        const boardsList = localDB.getBoards().filter(b => b.id !== selectedBoardId);
        localDB.saveBoards(boardsList);
        localStorage.removeItem(`agile_board_details_${selectedBoardId}`);
        setBoards(boardsList);
        setSelectedBoardId(boardsList.length > 0 ? boardsList[0].id : null);
        addActivity('Workspace Lead', `deleted board "${bName}"`, 'delete');
        return;
      }

      await fetch(`${API_BASE}/boards/${selectedBoardId}`, { method: 'DELETE' });
      const remaining = boards.filter(b => b.id !== selectedBoardId);
      setBoards(remaining);
      setSelectedBoardId(remaining.length > 0 ? remaining[0].id : null);
      addActivity('Workspace Lead', `deleted board "${bName}"`, 'delete');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    try {
      if (useLocalStorage) {
        const details = localDB.getBoardDetails(selectedBoardId);
        const allTags = localDB.getTags();
        const allMembers = localDB.getMembers();

        const cardTags = cardForm.tags.map(tid => allTags.find(t => t.id === tid)).filter(Boolean);
        const cardMember = allMembers.find(m => m.id === Number(cardForm.member_id)) || null;

        if (selectedCard) {
          details.lists = details.lists.map(lst => {
            const hasCard = lst.cards && lst.cards.some(c => c.id === selectedCard.id);
            if (hasCard) {
              lst.cards = lst.cards.map(c => {
                if (c.id === selectedCard.id) {
                  return {
                    ...c,
                    title: cardForm.title,
                    description: cardForm.description,
                    due_date: cardForm.due_date || null,
                    member_id: cardForm.member_id ? Number(cardForm.member_id) : null,
                    member: cardMember,
                    tags: cardTags,
                    subtasks: cardForm.subtasks || []
                  };
                }
                return c;
              });
            }
            return lst;
          });
          addActivity(cardMember ? cardMember.name : 'Team Member', `updated card "${cardForm.title}"`, 'edit');
        } else {
          const newCard = {
            id: Date.now(),
            board_list_id: cardListId,
            title: cardForm.title,
            description: cardForm.description,
            due_date: cardForm.due_date || null,
            member_id: cardForm.member_id ? Number(cardForm.member_id) : null,
            member: cardMember,
            tags: cardTags,
            subtasks: cardForm.subtasks || [],
            position: 1
          };
          details.lists = details.lists.map(lst => {
            if (lst.id === cardListId) {
              newCard.position = lst.cards ? lst.cards.length + 1 : 1;
              lst.cards = lst.cards || [];
              lst.cards.push(newCard);
            }
            return lst;
          });
          addActivity(cardMember ? cardMember.name : 'Team Member', `created card "${cardForm.title}"`, 'create');
        }

        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        setShowCardModal(false);
        setSelectedCard(null);
        return;
      }

      const url = selectedCard 
        ? `${API_BASE}/cards/${selectedCard.id}`
        : `${API_BASE}/cards`;
      
      const payload = {
        title: cardForm.title,
        description: cardForm.description,
        due_date: cardForm.due_date || null,
        member_id: cardForm.member_id || null,
        tags: cardForm.tags
      };

      if (!selectedCard) {
        payload.board_list_id = cardListId;
      }

      const res = await fetch(url, {
        method: selectedCard ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await res.json();
      fetchBoardDetails(selectedBoardId);
      setShowCardModal(false);
      setSelectedCard(null);
      addActivity('Team Member', selectedCard ? `updated card "${cardForm.title}"` : `created card "${cardForm.title}"`, selectedCard ? 'edit' : 'create');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      const cTitle = selectedCard ? selectedCard.title : 'Card';
      if (useLocalStorage) {
        const details = localDB.getBoardDetails(selectedBoardId);
        details.lists = details.lists.map(lst => {
          if (lst.cards) {
            lst.cards = lst.cards.filter(c => c.id !== cardId);
          }
          return lst;
        });
        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        setShowCardModal(false);
        setSelectedCard(null);
        addActivity('Team Member', `deleted card "${cTitle}"`, 'delete');
        return;
      }

      await fetch(`${API_BASE}/cards/${cardId}`, { method: 'DELETE' });
      fetchBoardDetails(selectedBoardId);
      setShowCardModal(false);
      setSelectedCard(null);
      addActivity('Team Member', `deleted card "${cTitle}"`, 'delete');
    } catch (err) {
      console.error(err);
    }
  };

  const openEditCardModal = (card) => {
    setSelectedCard(card);
    setCardForm({
      title: card.title,
      description: card.description || '',
      due_date: card.due_date ? card.due_date.substring(0, 16) : '',
      member_id: card.member_id || '',
      tags: card.tags ? card.tags.map(t => t.id) : [],
      subtasks: card.subtasks ? [...card.subtasks] : []
    });
    setNewSubtaskInput('');
    setShowCardModal(true);
  };

  const openCreateCardModal = (listId) => {
    setSelectedCard(null);
    setCardListId(listId);
    setCardForm({
      title: '',
      description: '',
      due_date: '',
      member_id: '',
      tags: [],
      subtasks: []
    });
    setNewSubtaskInput('');
    setShowCardModal(true);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    const newSt = {
      id: Date.now(),
      text: newSubtaskInput.trim(),
      completed: false
    };
    setCardForm(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSt]
    }));
    setNewSubtaskInput('');
  };

  const handleToggleSubtask = (cardId, subtaskId, e) => {
    e.stopPropagation();
    if (!boardDetails) return;
    const details = { ...boardDetails };
    let toggledText = '';
    let isNowCompleted = false;

    details.lists = details.lists.map(lst => {
      if (lst.cards) {
        lst.cards = lst.cards.map(c => {
          if (c.id === cardId) {
            const updatedSt = (c.subtasks || []).map(st => {
              if (st.id === subtaskId) {
                toggledText = st.text;
                isNowCompleted = !st.completed;
                return { ...st, completed: !st.completed };
              }
              return st;
            });
            return { ...c, subtasks: updatedSt };
          }
          return c;
        });
      }
      return lst;
    });

    setBoardDetails(details);
    if (useLocalStorage) {
      localDB.saveBoardDetails(selectedBoardId, details);
    }
    if (toggledText) {
      addActivity('Team Member', `${isNowCompleted ? 'completed' : 'reopened'} subtask "${toggledText}"`, 'check');
    }
  };

  const handleMoveCardStep = async (card, direction, e) => {
    e.stopPropagation();
    if (!boardDetails || !boardDetails.lists) return;
    const currentListIndex = boardDetails.lists.findIndex(l => l.id === card.board_list_id);
    if (currentListIndex === -1) return;

    const targetListIndex = direction === 'next' ? currentListIndex + 1 : currentListIndex - 1;
    if (targetListIndex < 0 || targetListIndex >= boardDetails.lists.length) return;

    const targetList = boardDetails.lists[targetListIndex];
    await handleDropDirect(card.id, card.board_list_id, targetList.id);
  };

  const handleDropDirect = async (cardId, oldListId, targetListId) => {
    if (oldListId === targetListId) return;

    const details = localDB.getBoardDetails(selectedBoardId) || boardDetails;
    let cardToMove = null;
    let targetListName = '';
    
    details.lists = details.lists.map(lst => {
      if (lst.id === oldListId && lst.cards) {
        cardToMove = lst.cards.find(c => c.id === cardId);
        lst.cards = lst.cards.filter(c => c.id !== cardId);
      }
      if (lst.id === targetListId) {
        targetListName = lst.name;
      }
      return lst;
    });

    if (cardToMove) {
      cardToMove.board_list_id = targetListId;
      details.lists = details.lists.map(lst => {
        if (lst.id === targetListId) {
          cardToMove.position = lst.cards ? lst.cards.length + 1 : 1;
          lst.cards = lst.cards || [];
          lst.cards.push(cardToMove);
        }
        return lst;
      });
      addActivity(cardToMove.member ? cardToMove.member.name : 'Team Member', `moved "${cardToMove.title}" to ${targetListName}`, 'move');
    }

    if (useLocalStorage) {
      localDB.saveBoardDetails(selectedBoardId, details);
      fetchBoardDetails(selectedBoardId);
      return;
    }

    setBoardDetails(details);
    try {
      await fetch(`${API_BASE}/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_list_id: targetListId, position: 1 })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      if (useLocalStorage) {
        const membersList = localDB.getMembers();
        const newMember = {
          id: Date.now(),
          name: memberForm.name,
          email: memberForm.email,
          avatar_color: memberForm.avatar_color
        };
        membersList.push(newMember);
        localDB.saveMembers(membersList);
        setMembers(membersList);
        setShowMemberModal(false);
        setMemberForm({ name: '', email: '', avatar_color: '#f54e00' });
        addActivity('Workspace Lead', `added team member "${memberForm.name}"`, 'create');
        return;
      }

      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm)
      });
      if (res.ok) {
        await fetchMembers();
        setShowMemberModal(false);
        setMemberForm({ name: '', email: '', avatar_color: '#f54e00' });
        addActivity('Workspace Lead', `added team member "${memberForm.name}"`, 'create');
      } else {
        const errData = await res.json();
        alert(errData.message || "Error creating member");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddActivityNote = (e) => {
    e.preventDefault();
    if (!newActivityNote.trim()) return;
    addActivity('You (Lead)', newActivityNote.trim(), 'comment');
    setNewActivityNote('');
  };

  const handleToggleFormTag = (tagId) => {
    const current = [...cardForm.tags];
    const index = current.indexOf(tagId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tagId);
    }
    setCardForm({ ...cardForm, tags: current });
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: card.id,
      oldListId: card.board_list_id
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    try {
      const rawData = e.dataTransfer.getData('text/plain');
      if (!rawData) return;
      const { cardId, oldListId } = JSON.parse(rawData);
      await handleDropDirect(cardId, oldListId, targetListId);
    } catch (err) {
      console.error("Drop handling failed:", err);
    }
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    return due < new Date();
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Compute Board Stats
  const computeStats = () => {
    if (!boardDetails || !boardDetails.lists) return { total: 0, done: 0, inProgress: 0, overdue: 0, percent: 0 };
    let total = 0;
    let done = 0;
    let inProgress = 0;
    let overdue = 0;

    boardDetails.lists.forEach(l => {
      const listName = l.name.toLowerCase();
      (l.cards || []).forEach(c => {
        total++;
        if (listName.includes('done') || listName.includes('completed')) {
          done++;
        } else if (listName.includes('progress') || listName.includes('review') || listName.includes('dev')) {
          inProgress++;
        }
        if (isOverdue(c.due_date)) {
          overdue++;
        }
      });
    });

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, overdue, percent };
  };

  const stats = computeStats();

  // Filter Cards Logic
  const getFilteredCards = (cards) => {
    if (!cards) return [];
    return cards.filter(c => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description && c.description.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      // Tag filter
      if (selectedTagFilter) {
        const hasTag = c.tags && c.tags.some(t => t.id === Number(selectedTagFilter));
        if (!hasTag) return false;
      }
      // Member filter
      if (selectedMemberFilter) {
        if (Number(c.member_id) !== Number(selectedMemberFilter)) return false;
      }
      // Overdue filter
      if (filterOverdueOnly) {
        if (!isOverdue(c.due_date)) return false;
      }
      return true;
    });
  };

  // Triggers the AI orchestration simulation
  const handleStartAISimulation = () => {
    setSimStep(0);
    setShowSimModal(true);
  };

  useEffect(() => {
    if (!showSimModal) return;
    if (simStep >= simSteps.length) {
      createSimulatedAIBoard();
      setTimeout(() => {
        setShowSimModal(false);
      }, 1000);
      return;
    }

    const timer = setTimeout(() => {
      setSimStep(prev => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showSimModal, simStep]);

  const createSimulatedAIBoard = () => {
    const boardId = 999;
    const newBoard = { id: boardId, name: 'AI Launchpad', lists_count: 3 };
    const boardsList = localDB.getBoards().filter(b => b.id !== boardId);
    boardsList.push(newBoard);
    localDB.saveBoards(boardsList);

    const specsId = 901;
    const devId = 902;
    const prodId = 903;

    const defaultMembers = localDB.getMembers();
    const defaultTags = localDB.getTags();

    const boardDetailsData = {
      id: boardId,
      name: 'AI Launchpad',
      lists: [
        {
          id: specsId,
          board_id: boardId,
          name: 'Specs',
          position: 1,
          cards: [
            {
              id: 911,
              board_list_id: specsId,
              title: 'Draft prompt configurations',
              description: 'Define prompt system roles for Hermes planning templates.',
              due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              member_id: defaultMembers[0].id,
              member: defaultMembers[0],
              position: 1,
              tags: [defaultTags[2]],
              subtasks: [{ id: 1, text: 'Review prompt engineering docs', completed: true }]
            }
          ]
        },
        {
          id: devId,
          board_id: boardId,
          name: 'Development',
          position: 2,
          cards: [
            {
              id: 912,
              board_list_id: devId,
              title: 'Connect Slack webhooks',
              description: 'Wire up Slack workspace socket mode for Hermes-OpenClaw comms.',
              due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
              member_id: defaultMembers[1].id,
              member: defaultMembers[1],
              position: 1,
              tags: [defaultTags[1], defaultTags[3]],
              subtasks: [{ id: 1, text: 'Verify Webhook Endpoints', completed: true }]
            }
          ]
        },
        {
          id: prodId,
          board_id: boardId,
          name: 'Production',
          position: 3,
          cards: [
            {
              id: 913,
              board_list_id: prodId,
              title: 'Verify offline demo capabilities',
              description: 'Verify localStorage database fallback works perfectly in browser environment.',
              due_date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
              member_id: defaultMembers[2].id,
              member: defaultMembers[2],
              position: 1,
              tags: [defaultTags[1]],
              subtasks: [{ id: 1, text: 'Test localStorage state persistence', completed: true }]
            }
          ]
        }
      ]
    };
    localDB.saveBoardDetails(boardId, boardDetailsData);
    setBoards(localDB.getBoards());
    setSelectedBoardId(boardId);
    addActivity('Hermes AI', 'generated sprint board "AI Launchpad"', 'system');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="kanban-app"
    >
      <header className="app-header">
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <ArrowLeft size={20} className="text-secondary hover-primary transition" style={{ marginRight: '8px' }} />
          <span className="brand-logo">AgileBoard</span>
          <span className="brand-tag">Workspace</span>
          {useLocalStorage && <span className="brand-tag" style={{ background: 'rgba(245, 78, 0, 0.1)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>Offline Mode</span>}
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleStartAISimulation}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={14} fill="currentColor" /> Simulate AI Build
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowActivityDrawer(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
          >
            <Activity size={16} /> Activity Log
            {activities.length > 0 && (
              <span style={{ backgroundColor: 'var(--accent-primary)', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '700' }}>
                {activities.length}
              </span>
            )}
          </button>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
            <User size={16} /> Add Member
          </button>
          <button className="btn btn-primary" onClick={() => setShowBoardModal(true)}>
            <Plus size={16} /> Create Board
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Board Select & Control Bar */}
        <div className="board-select-bar" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="board-picker">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Active Board:</span>
              {boards.length > 0 ? (
                <select 
                  className="select-dropdown" 
                  value={selectedBoardId || ''} 
                  onChange={(e) => setSelectedBoardId(Number(e.target.value))}
                >
                  {boards.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No boards created yet</span>
              )}
            </div>
            {selectedBoardId && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => setShowBriefModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} className="text-primary" /> AI Sprint Brief
                </button>
                <button className="btn btn-secondary" onClick={() => setShowListModal(true)}>
                  <Plus size={16} /> Add Column
                </button>
                <button className="btn btn-danger" onClick={handleDeleteBoard}>
                  <Trash2 size={16} /> Delete Board
                </button>
              </div>
            )}
          </div>

          {/* Sprint Metrics Widget */}
          {boardDetails && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'space-between', 
              padding: '0.75rem 1.25rem', 
              background: 'var(--bg-surface-soft)', 
              borderRadius: 'var(--rounded-md)', 
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Sprint Progress:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.percent}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{stats.total}</strong></span>
                  <span>In Progress: <strong style={{ color: '#f59e0b' }}>{stats.inProgress}</strong></span>
                  <span>Completed: <strong style={{ color: '#10b981' }}>{stats.done}</strong></span>
                  {stats.overdue > 0 && <span>Overdue: <strong style={{ color: '#ef4444' }}>{stats.overdue}</strong></span>}
                </div>
              </div>

              <div style={{ flex: 1, maxWidth: '240px', minWidth: '140px', background: 'var(--bg-surface-strong)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.percent}%`, backgroundColor: 'var(--accent-primary)', height: '100%', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}

          {/* Interactive Search & Filter Toolbar */}
          {selectedBoardId && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter tasks by title or description..." 
                  className="form-input" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
                />
              </div>

              <select 
                className="select-dropdown" 
                value={selectedTagFilter} 
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                style={{ height: '36px', fontSize: '0.85rem', padding: '0 0.75rem' }}
              >
                <option value="">All Tags</option>
                {tags.map(t => (
                  <option key={t.id} value={t.id}>Tag: {t.name}</option>
                ))}
              </select>

              <select 
                className="select-dropdown" 
                value={selectedMemberFilter} 
                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                style={{ height: '36px', fontSize: '0.85rem', padding: '0 0.75rem' }}
              >
                <option value="">All Assignees</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>Assignee: {m.name}</option>
                ))}
              </select>

              <button 
                className={`btn ${filterOverdueOnly ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
                style={{ height: '36px', fontSize: '0.82rem', padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <AlertCircle size={14} /> Overdue Only
              </button>

              {(searchQuery || selectedTagFilter || selectedMemberFilter || filterOverdueOnly) && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTagFilter('');
                    setSelectedMemberFilter('');
                    setFilterOverdueOnly(false);
                  }}
                  style={{ height: '36px', fontSize: '0.82rem', padding: '0 0.75rem', color: 'var(--accent-primary)' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
          </div>
        ) : boardDetails ? (
          <div className="board-canvas">
            {boardDetails.lists && boardDetails.lists.map((list, listIdx) => {
              const filteredListCards = getFilteredCards(list.cards);
              return (
                <div 
                  key={list.id} 
                  className="board-list"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, list.id)}
                >
                  <div className="list-header">
                    <div className="list-title-area">
                      <h3 className="list-title">{list.name}</h3>
                      <span className="card-count-badge">{filteredListCards.length}</span>
                    </div>
                    <button 
                      className="close-btn" 
                      style={{ fontSize: '1rem' }} 
                      onClick={async () => {
                        if (window.confirm(`Delete column "${list.name}" and all its cards?`)) {
                          if (useLocalStorage) {
                            const details = localDB.getBoardDetails(selectedBoardId);
                            details.lists = details.lists.filter(l => l.id !== list.id);
                            localDB.saveBoardDetails(selectedBoardId, details);
                            fetchBoardDetails(selectedBoardId);
                            addActivity('Workspace Lead', `deleted column "${list.name}"`, 'delete');
                            return;
                          }
                          await fetch(`${API_BASE}/lists/${list.id}`, { method: 'DELETE' });
                          fetchBoardDetails(selectedBoardId);
                          addActivity('Workspace Lead', `deleted column "${list.name}"`, 'delete');
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="list-cards-container">
                    <AnimatePresence>
                      {filteredListCards.map(card => {
                        const overdue = isOverdue(card.due_date);
                        const subtasks = card.subtasks || [];
                        const completedSubtasks = subtasks.filter(st => st.completed).length;

                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layoutId={`card-${card.id}`}
                            key={card.id} 
                            className={`kanban-card ${overdue ? 'overdue' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, card)}
                            onClick={() => openEditCardModal(card)}
                            style={{ position: 'relative' }}
                          >
                            <div className="card-hover-actions" style={{ position: 'absolute', right: '8px', top: '8px', display: 'flex', gap: '4px', opacity: 0.8 }}>
                              {listIdx > 0 && (
                                <button 
                                  title="Move to previous column"
                                  onClick={(e) => handleMoveCardStep(card, 'prev', e)}
                                  style={{ border: 'none', background: 'var(--bg-surface-strong)', padding: '2px 4px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                >
                                  <ChevronLeft size={14} />
                                </button>
                              )}
                              {listIdx < boardDetails.lists.length - 1 && (
                                <button 
                                  title="Move to next column"
                                  onClick={(e) => handleMoveCardStep(card, 'next', e)}
                                  style={{ border: 'none', background: 'var(--bg-surface-strong)', padding: '2px 4px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                >
                                  <ChevronRight size={14} />
                                </button>
                              )}
                            </div>

                            {card.tags && card.tags.length > 0 && (
                              <div className="card-tags">
                                {card.tags.map(t => (
                                  <span 
                                    key={t.id} 
                                    className="tag-badge"
                                    style={{ backgroundColor: t.color + '22', color: t.color, border: `1px solid ${t.color}44` }}
                                  >
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <h4 className="card-title">{card.title}</h4>
                            {card.description && (
                              <p className="card-desc-preview">{card.description}</p>
                            )}

                            {/* Subtask Checklist Summary */}
                            {subtasks.length > 0 && (
                              <div style={{ marginTop: '0.6rem', padding: '0.4rem 0.6rem', background: 'var(--bg-surface-soft)', borderRadius: '4px', fontSize: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckSquare size={12} /> {completedSubtasks}/{subtasks.length} Subtasks
                                  </span>
                                  <span>{Math.round((completedSubtasks / subtasks.length) * 100)}%</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${(completedSubtasks / subtasks.length) * 100}%`, height: '100%', backgroundColor: '#10b981' }} />
                                </div>
                              </div>
                            )}

                            <div className="card-meta" style={{ marginTop: '0.75rem' }}>
                              <div className={`card-due-date ${overdue ? 'alert' : ''}`}>
                                {card.due_date ? (
                                  <>
                                    <Calendar size={12} />
                                    <span>{new Date(card.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    {overdue && <span style={{ marginLeft: '4px', fontSize: '0.65rem', textTransform: 'uppercase' }}>(Overdue)</span>}
                                  </>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>No due date</span>
                                )}
                              </div>
                              {card.member && (
                                <div 
                                  className="member-avatar" 
                                  style={{ backgroundColor: card.member.avatar_color }}
                                  title={card.member.name}
                                >
                                  {getInitials(card.member.name)}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {filteredListCards.length === 0 && (
                      <div className="placeholder-card kanban-card">
                        No cards match filter
                      </div>
                    )}
                  </div>
                  <div className="list-footer">
                    <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => openCreateCardModal(list.id)}>
                      <Plus size={16} /> Add Card
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle2 size={48} className="text-secondary" />
            <h2>Welcome to your Workspace</h2>
            <p>Click "Create Board" to start a new workspace or click the button below to populate it with sample data.</p>
            <button className="btn btn-primary" onClick={handleSeedDemo} disabled={seeding}>
              {seeding ? 'Seeding...' : '🚀 Seed Demo Board'}
            </button>
          </div>
        )}
      </div>

      {/* Slide-over Activity Log Drawer */}
      <AnimatePresence>
        {showActivityDrawer && (
          <div className="modal-overlay" style={{ justifyContent: 'flex-end', background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowActivityDrawer(false)}>
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: '100%', maxWidth: '420px', height: '100vh', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '1.5rem', boxShadow: 'var(--glass-shadow)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} className="text-primary" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Workspace Activities</h3>
                </div>
                <button className="close-btn" onClick={() => setShowActivityDrawer(false)}>✕</button>
              </div>

              {/* Add Activity Note */}
              <form onSubmit={handleAddActivityNote} style={{ marginBottom: '1rem', display: 'flex', gap: '6px' }}>
                <input 
                  type="text" 
                  placeholder="Post team update / activity note..."
                  className="form-input"
                  value={newActivityNote}
                  onChange={(e) => setNewActivityNote(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 0.75rem' }}>
                  <Send size={14} />
                </button>
              </form>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activities.map((act) => (
                  <div key={act.id} style={{ padding: '0.75rem', borderRadius: 'var(--rounded-sm)', background: 'var(--bg-surface-soft)', border: '1px solid var(--border-color-soft)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{act.user}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{act.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Sprint Brief Modal */}
      <AnimatePresence>
        {showBriefModal && (
          <div className="modal-overlay" onClick={() => setShowBriefModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              style={{ maxWidth: '520px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="modal-title">AI Sprint Digest</h3>
                </div>
                <button className="close-btn" onClick={() => setShowBriefModal(false)}>✕</button>
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '1rem' }}>
                  🤖 <strong>Hermes Workspace Intelligence Report:</strong>
                </p>
                <div style={{ background: 'var(--bg-surface-soft)', padding: '1rem', borderRadius: 'var(--rounded-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>• 📊 <strong>Overall Progress:</strong> {stats.percent}% of sprint objectives completed ({stats.done}/{stats.total} cards).</div>
                  <div style={{ marginBottom: '0.5rem' }}>• ⚡ <strong>Active Stream:</strong> {stats.inProgress} tasks are currently under active development.</div>
                  <div>• 🚨 <strong>Attention Needed:</strong> {stats.overdue > 0 ? `${stats.overdue} tasks require immediate resolution as they are past due.` : 'Zero overdue tasks! Sprint pace is optimal.'}</div>
                </div>
                <p>Recommendations: Maintain current pull-request review velocity and verify staging deployment before release.</p>
              </div>
              <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setShowBriefModal(false)}>Acknowledge Brief</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Board Create Modal */}
      <AnimatePresence>
        {showBoardModal && (
          <div className="modal-overlay">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content" 
              onSubmit={handleCreateBoard}
            >
              <div className="modal-header">
                <h3 className="modal-title">Create Board</h3>
                <button type="button" className="close-btn" onClick={() => setShowBoardModal(false)}>✕</button>
              </div>
              <div className="form-group">
                <label className="form-label">Board Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Sprint Planning, Project Beta" 
                  value={newBoardName} 
                  onChange={(e) => setNewBoardName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBoardModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Board</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Column Create Modal */}
      <AnimatePresence>
        {showListModal && (
          <div className="modal-overlay">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content" 
              onSubmit={handleCreateList}
            >
              <div className="modal-header">
                <h3 className="modal-title">Add Column</h3>
                <button type="button" className="close-btn" onClick={() => setShowListModal(false)}>✕</button>
              </div>
              <div className="form-group">
                <label className="form-label">Column Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Quality Assurance, Deployed" 
                  value={newListName} 
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowListModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Column</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Card Edit / Create Modal */}
      <AnimatePresence>
        {showCardModal && (
          <div className="modal-overlay">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content" 
              onSubmit={handleSaveCard}
              style={{ maxWidth: '580px' }}
            >
              <div className="modal-header">
                <h3 className="modal-title">{selectedCard ? 'Edit Card' : 'Create Card'}</h3>
                <button type="button" className="close-btn" onClick={() => setShowCardModal(false)}>✕</button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardForm.title} 
                  onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  value={cardForm.description} 
                  onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                />
              </div>

              {/* Subtasks Checklist Manager inside Card Modal */}
              <div className="form-group">
                <label className="form-label">Subtasks & Checklist</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Add a subtask step..." 
                    className="form-input"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddSubtask}>
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                  {(cardForm.subtasks || []).map(st => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'var(--bg-surface-soft)', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={st.completed}
                        onChange={() => {
                          const updated = cardForm.subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                          setCardForm({ ...cardForm, subtasks: updated });
                        }}
                      />
                      <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1 }}>
                        {st.text}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = cardForm.subtasks.filter(s => s.id !== st.id);
                          setCardForm({ ...cardForm, subtasks: updated });
                        }}
                        style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={cardForm.due_date} 
                  onChange={(e) => setCardForm({ ...cardForm, due_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select 
                  className="form-select"
                  value={cardForm.member_id}
                  onChange={(e) => setCardForm({ ...cardForm, member_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-selector-grid">
                  {tags.map(t => {
                    const isSelected = cardForm.tags.includes(t.id);
                    return (
                      <div 
                        key={t.id} 
                        className={`tag-select-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleFormTag(t.id)}
                      >
                        <span className="tag-color-circle" style={{ backgroundColor: t.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', marginRight: '8px' }} />
                        <span>{t.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <div>
                  {selectedCard && (
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteCard(selectedCard.id)}
                    >
                      Delete Card
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCardModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{selectedCard ? 'Save Changes' : 'Create Card'}</button>
                </div>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Member Create Modal */}
      <AnimatePresence>
        {showMemberModal && (
          <div className="modal-overlay">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content" 
              onSubmit={handleCreateMember}
            >
              <div className="modal-header">
                <h3 className="modal-title">Add Board Member</h3>
                <button type="button" className="close-btn" onClick={() => setShowMemberModal(false)}>✕</button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={memberForm.name} 
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. john@example.com"
                  value={memberForm.email} 
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Color</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['#f54e00', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'].map(color => (
                    <div 
                      key={color} 
                      onClick={() => setMemberForm({ ...memberForm, avatar_color: color })}
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        backgroundColor: color, 
                        cursor: 'pointer',
                        border: memberForm.avatar_color === color ? '2px solid var(--text-primary)' : '2px solid transparent',
                        boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                      }} 
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* AI Orchestration Simulation Modal */}
      <AnimatePresence>
        {showSimModal && (
          <div className="modal-overlay" style={{ backgroundColor: 'rgba(38, 37, 30, 0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowSimModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content"
              style={{ maxWidth: '640px', padding: '0', overflow: 'hidden', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px rgba(245, 78, 0, 0.15)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ide-header" style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-surface-soft)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="ide-dot" style={{ backgroundColor: '#ff5f56' }}></div>
                <div className="ide-dot" style={{ backgroundColor: '#ffbd2e' }}></div>
                <div className="ide-dot" style={{ backgroundColor: '#27c93f' }}></div>
                <div className="ide-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 0 1rem', fontFamily: 'var(--font-mono)' }}>
                  <Terminal size={14} className="text-primary" /> slack-socket-agent-orchestrator.log
                </div>
              </div>
              
              <div style={{ height: '360px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-surface)' }}>
                {simSteps.slice(0, simStep + 1).map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      background: 'var(--bg-surface-soft)',
                      padding: '0.75rem 1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', borderBottom: '1px solid var(--border-color-soft)', paddingBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '4px', 
                          background: 'var(--accent-primary)', 
                          color: '#fff', 
                          fontWeight: '700', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '11px'
                        }}>
                          {step.avatar}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{step.sender}</span>
                      </div>
                      <span className={`timeline-pill timeline-pill-${step.status}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{step.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--text-secondary)', fontFamily: step.status === 'grep' || step.status === 'edit' || step.status === 'done' ? 'var(--font-mono)' : 'var(--font-sans)' }}>
                      {step.text}
                    </p>
                  </motion.div>
                ))}
              </div>
              
              <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface-soft)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {simStep < simSteps.length ? '🤖 Agent compiling workspace...' : '✅ Compilation done!'}
                </span>
                <span className="timeline-pill timeline-pill-thinking" style={{ animation: simStep < simSteps.length ? 'pulse 1s infinite' : 'none' }}>
                  {simStep < simSteps.length ? 'BUILDING' : 'READY'}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Board;
