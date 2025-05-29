// src/hooks/useGlobalChatState.ts - Updated with Session Management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatSessionsApi } from '../services/api';

interface Message {
    id: number;
    type: 'user' | 'system' | 'error';
    text: string;
    timestamp?: number;
}

interface GlobalChatState {
    // Chat state
    messages: Message[];
    selectedDocuments: string[];
    expandedDocumentId: string | null;
    isVisualizationPanelOpen: boolean;
    isHydrated: boolean;
    currentSessionId: string | null; // NEW: Track current session

    // Actions
    addMessage: (message: Omit<Message, 'id'>) => void;
    clearMessages: () => void;
    setSelectedDocuments: (documents: string[]) => void;
    setExpandedDocumentId: (id: string | null) => void;
    setVisualizationPanelOpen: (open: boolean) => void;
    setHydrated: (hydrated: boolean) => void;
    setCurrentSessionId: (sessionId: string | null) => void; // NEW

    // Session management
    createNewSession: (firstMessage?: string) => Promise<string | null>; // NEW
    loadSession: (sessionId: string, messages: Message[], documents: string[]) => void; // NEW

    // Reset specific page state
    resetPageState: () => void;
}

const initialMessage: Message = {
    id: 1,
    type: 'system',
    text: 'I can help you analyze your documents. What would you like to know?'
};

export const useGlobalChatState = create<GlobalChatState>()(
    persist(
        (set, get) => ({
            // Initial state - no timestamps to avoid hydration issues
            messages: [initialMessage],
            selectedDocuments: [],
            expandedDocumentId: null,
            isVisualizationPanelOpen: false,
            isHydrated: false,
            currentSessionId: null, // NEW

            // Actions
            addMessage: (message) => {
                const newMessage = {
                    ...message,
                    id: Date.now() + Math.random(), // Ensure unique IDs
                    timestamp: Date.now()
                };
                set((state) => ({
                    messages: [...state.messages, newMessage]
                }));
            },

            clearMessages: () => {
                set({
                    messages: [initialMessage],
                    currentSessionId: null // Clear current session when clearing messages
                });
            },

            setSelectedDocuments: (documents) => {
                set({ selectedDocuments: documents });
            },

            setExpandedDocumentId: (id) => {
                set({ expandedDocumentId: id });
            },

            setVisualizationPanelOpen: (open) => {
                set({ isVisualizationPanelOpen: open });
            },

            setHydrated: (hydrated) => {
                set({ isHydrated: hydrated });
            },

            setCurrentSessionId: (sessionId) => {
                set({ currentSessionId: sessionId });
            },

            // NEW: Create a new session
            createNewSession: async (firstMessage) => {
                try {
                    const state = get();

                    // Generate session title from first message or use default
                    const title = firstMessage
                        ? generateSessionTitle(firstMessage)
                        : 'New Chat Session';

                    console.log('🆕 Creating new session:', title);

                    const response = await chatSessionsApi.createSession({
                        title,
                        selected_documents: state.selectedDocuments,
                        document_names: [] // Can be populated later if needed
                    });

                    if (response.status === 'success' && response.session_id) {
                        console.log('✅ Session created:', response.session_id);
                        set({ currentSessionId: response.session_id });
                        return response.session_id;
                    } else {
                        console.error('❌ Failed to create session:', response);
                        return null;
                    }
                } catch (error) {
                    console.error('💥 Error creating session:', error);
                    return null;
                }
            },

            // NEW: Load a session
            loadSession: (sessionId, messages, documents) => {
                console.log('📖 Loading session:', sessionId);
                set({
                    currentSessionId: sessionId,
                    messages: messages.length ? messages : [initialMessage],
                    selectedDocuments: documents || []
                });
            },

            resetPageState: () => {
                set({
                    messages: [initialMessage],
                    selectedDocuments: [],
                    expandedDocumentId: null,
                    isVisualizationPanelOpen: false,
                    currentSessionId: null // Reset session
                });
            }
        }),
        {
            name: 'zoku-chat-state',
            partialize: (state) => ({
                messages: state.messages,
                selectedDocuments: state.selectedDocuments,
                currentSessionId: state.currentSessionId, // Persist current session
            }),
            version: 1,
            skipHydration: true,
        }
    )
);

// Helper function to generate session titles
function generateSessionTitle(firstMessage: string): string {
    try {
        // Clean up the message and take first few words
        const cleaned = firstMessage.replace(/[^\w\s]/g, '').trim();
        const words = cleaned.split(/\s+/).slice(0, 6); // First 6 words
        const title = words.join(' ');

        // Fallback titles based on content
        if (title.toLowerCase().includes('total')) return 'Total Amount Query';
        if (title.toLowerCase().includes('vendor')) return 'Vendor Information';
        if (title.toLowerCase().includes('date')) return 'Date Extraction';
        if (title.toLowerCase().includes('summarize')) return 'Document Summary';

        if (title.length < 3) return 'New Chat Session';

        // Capitalize first letter of each word
        return title.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

    } catch (error) {
        return 'New Chat Session';
    }
}
