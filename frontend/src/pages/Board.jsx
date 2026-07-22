import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, User, CheckCircle2, GripVertical, AlertCircle, Sun, Moon, Play, MessageSquare, Terminal } from 'lucide-react';
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
    const details = JSON.parse(localStorage.getItem(`agile_board_details_${id}`) || 'null');
    if (!details && id === 101) {
      // Auto seed details for Project Alpha if missing
      const defaultMembers = localDB.getMembers();
      const defaultTags = localDB.getTags();
      const alphaDetails = {
        id: 101,
        name: 'Project Alpha',
        lists: [
          {
            id: 201,
            board_id: 101,
            name: 'To Do',
            position: 1,
            cards: [
              {
                id: 301,
                board_list_id: 201,
                title: 'Scaffold backend API',
                description: 'Create Laravel API, migrations, controllers and routes for boards/lists/cards.',
                due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
                member_id: defaultMembers[0].id,
                member: defaultMembers[0],
                position: 1,
                tags: [defaultTags[1], defaultTags[3]]
              },
              {
                id: 302,
                board_list_id: 201,
                title: 'Integrate Slack channels',
                description: 'Set up bot tokens and wire Hermes + OpenClaw into Slack channels.',
                due_date: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
                member_id: defaultMembers[1].id,
                member: defaultMembers[1],
                position: 2,
                tags: [defaultTags[3]]
              }
            ]
          },
          {
            id: 202,
            board_id: 101,
            name: 'In Progress',
            position: 2,
            cards: [
              {
                id: 303,
                board_list_id: 202,
                title: 'Build React dashboard UI',
                description: 'Develop responsive board layouts, swimlanes, and interactive modals in React.',
                due_date: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
                member_id: defaultMembers[2].id,
                member: defaultMembers[2],
                position: 1,
                tags: [defaultTags[2]]
              }
            ]
          },
          {
            id: 203,
            board_id: 101,
            name: 'Done',
            position: 3,
            cards: [
              {
                id: 304,
                board_list_id: 203,
                title: 'Setup project repo',
                description: 'Initialize Git repository, configure .gitignore, and prepare basic structure.',
                due_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
                member_id: defaultMembers[3].id,
                member: defaultMembers[3],
                position: 1,
                tags: [defaultTags[1]]
              }
            ]
          }
        ]
      };
      localStorage.setItem(`agile_board_details_101`, JSON.stringify(alphaDetails));
      return alphaDetails;
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
    tags: []
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', avatar_color: '#f54e00' });

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

  useEffect(() => {
    // Ping backend to check if we should run in offline mode
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
            {
              id: 201,
              board_id: boardId,
              name: 'To Do',
              position: 1,
              cards: [
                {
                  id: 301,
                  board_list_id: 201,
                  title: 'Scaffold backend API',
                  description: 'Create Laravel API, migrations, controllers and routes for boards/lists/cards.',
                  due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
                  member_id: defaultMembers[0].id,
                  member: defaultMembers[0],
                  position: 1,
                  tags: [defaultTags[1], defaultTags[3]]
                },
                {
                  id: 302,
                  board_list_id: 201,
                  title: 'Integrate Slack channels',
                  description: 'Set up bot tokens and wire Hermes + OpenClaw into Slack channels.',
                  due_date: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
                  member_id: defaultMembers[1].id,
                  member: defaultMembers[1],
                  position: 2,
                  tags: [defaultTags[3]]
                }
              ]
            },
            {
              id: 202,
              board_id: boardId,
              name: 'In Progress',
              position: 2,
              cards: [
                {
                  id: 303,
                  board_list_id: 202,
                  title: 'Build React dashboard UI',
                  description: 'Develop responsive board layouts, swimlanes, and interactive modals in React.',
                  due_date: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
                  member_id: defaultMembers[2].id,
                  member: defaultMembers[2],
                  position: 1,
                  tags: [defaultTags[2]]
                }
              ]
            },
            {
              id: 203,
              board_id: boardId,
              name: 'Done',
              position: 3,
              cards: [
                {
                  id: 304,
                  board_list_id: 203,
                  title: 'Setup project repo',
                  description: 'Initialize Git repository, configure .gitignore, and prepare basic structure.',
                  due_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
                  member_id: defaultMembers[3].id,
                  member: defaultMembers[3],
                  position: 1,
                  tags: [defaultTags[1]]
                }
              ]
            }
          ]
        };

        localDB.saveBoardDetails(boardId, alphaDetails);
        setBoards(boardsList);
        setSelectedBoardId(boardId);
        setSeeding(false);
        return;
      }

      const res = await fetch(`${API_BASE}/seed-demo`, { method: 'POST' });
      await res.json();
      await fetchBoards();
      await fetchMembers();
      await fetchTags();
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

        const todoId = boardId + 1;
        const doingId = boardId + 2;
        const doneId = boardId + 3;

        const boardDetailsData = {
          id: boardId,
          name: newBoardName,
          lists: [
            { id: todoId, board_id: boardId, name: 'To Do', position: 1, cards: [] },
            { id: doingId, board_id: boardId, name: 'In Progress', position: 2, cards: [] },
            { id: doneId, board_id: boardId, name: 'Done', position: 3, cards: [] }
          ]
        };
        localDB.saveBoardDetails(boardId, boardDetailsData);
        setBoards(boardsList);
        setSelectedBoardId(boardId);
        setNewBoardName('');
        setShowBoardModal(false);
        return;
      }

      const res = await fetch(`${API_BASE}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName })
      });
      const data = await res.json();
      setBoards([...boards, data]);
      setSelectedBoardId(data.id);
      setNewBoardName('');
      setShowBoardModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim() || !selectedBoardId) return;
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBoard = async () => {
    if (!selectedBoardId || !window.confirm("Are you sure you want to delete this board and all its tasks?")) return;
    try {
      if (useLocalStorage) {
        const boardsList = localDB.getBoards().filter(b => b.id !== selectedBoardId);
        localDB.saveBoards(boardsList);
        localStorage.removeItem(`agile_board_details_${selectedBoardId}`);
        setBoards(boardsList);
        setSelectedBoardId(boardsList.length > 0 ? boardsList[0].id : null);
        return;
      }

      await fetch(`${API_BASE}/boards/${selectedBoardId}`, { method: 'DELETE' });
      const remaining = boards.filter(b => b.id !== selectedBoardId);
      setBoards(remaining);
      setSelectedBoardId(remaining.length > 0 ? remaining[0].id : null);
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
                    tags: cardTags
                  };
                }
                return c;
              });
            }
            return lst;
          });
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Delete this card?")) return;
    try {
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
        return;
      }

      await fetch(`${API_BASE}/cards/${cardId}`, { method: 'DELETE' });
      fetchBoardDetails(selectedBoardId);
      setShowCardModal(false);
      setSelectedCard(null);
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
      tags: card.tags ? card.tags.map(t => t.id) : []
    });
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
      tags: []
    });
    setShowCardModal(true);
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
      } else {
        const errData = await res.json();
        alert(errData.message || "Error creating member");
      }
    } catch (err) {
      console.error(err);
    }
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
      
      if (oldListId === targetListId) return;

      if (useLocalStorage) {
        const details = localDB.getBoardDetails(selectedBoardId);
        let cardToMove = null;
        
        details.lists = details.lists.map(lst => {
          if (lst.id === oldListId) {
            cardToMove = lst.cards.find(c => c.id === cardId);
            lst.cards = lst.cards.filter(c => c.id !== cardId);
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
        }
        
        localDB.saveBoardDetails(selectedBoardId, details);
        fetchBoardDetails(selectedBoardId);
        return;
      }

      const list = boardDetails.lists.find(l => l.id === targetListId);
      const newPos = list.cards ? list.cards.length + 1 : 1;

      const updatedLists = boardDetails.lists.map(l => {
        if (l.id === oldListId) {
          return { ...l, cards: l.cards.filter(c => c.id !== cardId) };
        }
        if (l.id === targetListId) {
          const cardToMove = boardDetails.lists.flatMap(lst => lst.cards).find(c => c.id === cardId);
          if (cardToMove) {
            const moved = { ...cardToMove, board_list_id: targetListId, position: newPos };
            return { ...l, cards: [...(l.cards || []), moved] };
          }
        }
        return l;
      });
      setBoardDetails({ ...boardDetails, lists: updatedLists });

      await fetch(`${API_BASE}/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_list_id: targetListId,
          position: newPos
        })
      });
      
      fetchBoardDetails(selectedBoardId);
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

  // Triggers the AI orchestration simulation
  const handleStartAISimulation = () => {
    setSimStep(0);
    setShowSimModal(true);
  };

  useEffect(() => {
    if (!showSimModal) return;
    if (simStep >= simSteps.length) {
      // Complete simulation and seed the board
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
              tags: [defaultTags[2]]
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
              tags: [defaultTags[1], defaultTags[3]]
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
              tags: [defaultTags[1]]
            }
          ]
        }
      ]
    };
    localDB.saveBoardDetails(boardId, boardDetailsData);
    setBoards(localDB.getBoards());
    setSelectedBoardId(boardId);
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
        <div className="board-select-bar">
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
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowListModal(true)}>
                <Plus size={16} /> Add Column
              </button>
              <button className="btn btn-danger" onClick={handleDeleteBoard}>
                <Trash2 size={16} /> Delete Board
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
          </div>
        ) : boardDetails ? (
          <div className="board-canvas">
            {boardDetails.lists && boardDetails.lists.map(list => (
              <div 
                key={list.id} 
                className="board-list"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, list.id)}
              >
                <div className="list-header">
                  <div className="list-title-area">
                    <h3 className="list-title">{list.name}</h3>
                    <span className="card-count-badge">{list.cards ? list.cards.length : 0}</span>
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
                          return;
                        }
                        await fetch(`${API_BASE}/lists/${list.id}`, { method: 'DELETE' });
                        fetchBoardDetails(selectedBoardId);
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="list-cards-container">
                  <AnimatePresence>
                    {list.cards && list.cards.map(card => {
                      const overdue = isOverdue(card.due_date);
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
                        >
                          <GripVertical size={14} className="drag-handle" style={{ display: 'none' }} />
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
                          <div className="card-meta">
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
                  {(!list.cards || list.cards.length === 0) && (
                    <div className="placeholder-card kanban-card">
                      Drop cards here
                    </div>
                  )}
                </div>
                <div className="list-footer">
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => openCreateCardModal(list.id)}>
                    <Plus size={16} /> Add Card
                  </button>
                </div>
              </div>
            ))}
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
          <div className="modal-overlay" style={{ backgroundColor: 'rgba(38, 37, 30, 0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content"
              style={{ maxWidth: '640px', padding: '0', overflow: 'hidden', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px rgba(245, 78, 0, 0.15)' }}
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
