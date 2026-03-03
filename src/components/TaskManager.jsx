import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/TaskManager.css';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState({});
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState({ title: '', assigned_to: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, membersData] = await Promise.all([
                api.getTasks(),
                api.getMembers()
            ]);
            
            const membersMap = {};
            membersData.forEach(m => {
                membersMap[m.id] = m;
            });
            
            setTasks(tasksData || []);
            setMembers(membersMap);
        } catch (err) {
            console.error('Error al cargar datos del gestor de tareas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        try {
            await api.createTask({
                title: newTask.title,
                assigned_to: newTask.assigned_to || null
            });
            setNewTask({ title: '', assigned_to: '' });
            loadData();
        } catch (err) {
            console.error('Error al crear tarea:', err);
        }
    };

    const toggleTask = async (task) => {
        try {
            await api.updateTask(task.id, { completed: !task.completed });
            loadData();
        } catch (err) {
            console.error('Error al actualizar tarea:', err);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
        try {
            await api.deleteTask(id);
            loadData();
        } catch (err) {
            console.error('Error al eliminar tarea:', err);
        }
    };

    if (loading) return <div className="loading-container">Cargando Gestor de Tareas...</div>;

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="task-manager">
            <header className="task-header">
                <h1>📋 Gestor Virtual de Tareas</h1>
                <p className="task-subtitle">Organiza y asigna las responsabilidades de la familia</p>
            </header>

            <section className="task-input-section">
                <form onSubmit={handleCreateTask} className="task-form">
                    <input 
                        type="text" 
                        placeholder="Nueva tarea rápida..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className="task-input"
                    />
                    <select 
                        value={newTask.assigned_to}
                        onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                        className="task-select"
                    >
                        <option value="">Asignar a...</option>
                        {Object.values(members).map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn-add-task">Añadir</button>
                </form>
            </section>

            <div className="task-columns">
                <section className="task-column pending">
                    <h2>Pendientes ({pendingTasks.length})</h2>
                    <div className="task-list">
                        {pendingTasks.map(task => (
                            <div key={task.id} className="task-card">
                                <div className="task-card-content" onClick={() => toggleTask(task)}>
                                    <div className="task-checkbox"></div>
                                    <div className="task-info">
                                        <h3>{task.title}</h3>
                                        <p>{task.description}</p>
                                        {task.assigned_to && (
                                            <span className="task-assignee">
                                                👤 {members[task.assigned_to]?.name || 'Miembro'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="btn-delete">×</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="task-column completed">
                    <h2>Completadas ({completedTasks.length})</h2>
                    <div className="task-list">
                        {completedTasks.map(task => (
                            <div key={task.id} className="task-card is-completed">
                                <div className="task-card-content" onClick={() => toggleTask(task)}>
                                    <div className="task-checkbox checked">✓</div>
                                    <div className="task-info">
                                        <h3>{task.title}</h3>
                                        <p className="task-done-date">Completada</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="btn-delete">×</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TaskManager;
