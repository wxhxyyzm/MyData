import { useEffect, useState } from 'react';
import { Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import BottomTabBar from '../../components/BottomTabBar';
import ErrorScreen from '../../components/ErrorScreen';
import LoadingScreen from '../../components/LoadingScreen';
import TopBar from '../../components/TopBar';
import { ClipboardList, Lightbulb } from '../../icons';
import { insertList, loadLists, loadNotes } from './api';
import { DEFAULT_LISTS } from './presets';
import ListView from './views/ListView';
import ListsView from './views/ListsView';
import NotesView from './views/NotesView';

const TABS = [
  { id: 'lists', label: '清单', Icon: ClipboardList },
  { id: 'notes', label: '灵感', Icon: Lightbulb },
];

export default function FoyerPage() {
  const [notes, setNotes] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([loadNotes(), loadLists()])
      .then(async ([notesData, listsData]) => {
        setNotes(notesData);
        if (listsData.length === 0) {
          const defaults = await Promise.all(DEFAULT_LISTS.map((l) => insertList(l)));
          setLists(defaults);
        } else {
          setLists(listsData);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div data-room="foyer" className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <TopBar title="玄关" emoji="🚪" />
      <LoadingScreen />
    </div>
  );

  if (error) return (
    <div data-room="foyer" className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <TopBar title="玄关" emoji="🚪" />
      <ErrorScreen title="玄关加载失败" message={error.message} />
    </div>
  );

  return (
    <div data-room="foyer" className="min-h-screen pb-24 paper-texture" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <Routes>
        <Route index element={<MainView notes={notes} setNotes={setNotes} lists={lists} setLists={setLists} />} />
        <Route path="list/:listId" element={<ListDetailView lists={lists} />} />
      </Routes>
    </div>
  );
}

function MainView({ notes, setNotes, lists, setLists }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'lists';
  return (
    <>
      <TopBar title="玄关" emoji="🚪" />
      <main className="mx-auto max-w-md p-4">
        {tab === 'notes' && <NotesView notes={notes} setNotes={setNotes} />}
        {tab === 'lists' && <ListsView lists={lists} setLists={setLists} />}
      </main>
      <BottomTabBar tabs={TABS} active={tab} onChange={(id) => setSearchParams({ tab: id }, { replace: true })} />
    </>
  );
}

function ListDetailView({ lists }) {
  const { listId } = useParams();
  const list = lists.find((l) => String(l.id) === listId);
  return (
    <>
      <TopBar title={list?.title || '清单'} emoji={list?.emoji || '📋'} />
      <main className="mx-auto max-w-md p-4">
        <ListView lists={lists} />
      </main>
    </>
  );
}
