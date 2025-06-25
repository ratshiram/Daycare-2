
import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '@/app/app';
import { Icons } from '@/components/Icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Child, Message } from '@/types';

export const CommunicationsPage: React.FC = () => {
    const { currentUser, children, messages, addMessageToSupabase } = useAppState();
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [messageContent, setMessageContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, selectedChild]);

    const getVisibleChildren = () => {
        if (!Array.isArray(children)) return [];
        if (currentUser.role === 'parent') {
            return children.filter(c => c.child_parents.some(cp => cp.parents?.id === currentUser.profileId));
        }
        return children.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const visibleChildren = getVisibleChildren();

    useEffect(() => {
        // Auto-select first child for parents if they only have one
        if (currentUser.role === 'parent' && visibleChildren.length === 1 && !selectedChild) {
            setSelectedChild(visibleChildren[0]);
        }
    }, [children, currentUser.role, visibleChildren, selectedChild]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedChild && messageContent.trim() && addMessageToSupabase) {
            addMessageToSupabase(selectedChild.id, messageContent);
            setMessageContent('');
        }
    };

    const threadMessages = Array.isArray(messages) ? messages.filter(m => m.child_id === selectedChild?.id) : [];

    const getSenderInitial = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    }

    return (
        <div className="page-card h-full flex flex-col md:flex-row gap-0 overflow-hidden">
            {/* Children List Panel */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Conversations</h3>
                    {currentUser.role !== 'parent' && (
                        <Input 
                            placeholder="Search child..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="mt-2"
                        />
                    )}
                </div>
                <ScrollArea className="flex-1">
                    {visibleChildren.length > 0 ? (
                        <ul>
                            {visibleChildren.map(child => {
                                const primaryParent = child.child_parents?.find(cp => cp.is_primary)?.parents;
                                const parentName = primaryParent ? `${primaryParent.first_name} ${primaryParent.last_name}` : 'No primary parent';
                                return (
                                    <li key={child.id}>
                                        <button
                                            onClick={() => setSelectedChild(child)}
                                            className={`w-full text-left p-4 hover:bg-accent ${selectedChild?.id === child.id ? 'bg-accent' : ''}`}
                                        >
                                            <p className="font-semibold">{child.name}</p>
                                            <p className="text-sm text-muted-foreground">Parent: {parentName}</p>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="p-4 text-muted-foreground">No children found.</p>
                    )}
                </ScrollArea>
            </div>

            {/* Chat Panel */}
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col h-full bg-background">
                {selectedChild ? (
                    <>
                        <div className="p-4 border-b flex items-center">
                            <h3 className="text-lg font-semibold">Chat with parent of {selectedChild.name}</h3>
                        </div>
                        <ScrollArea className="flex-1 p-4 bg-muted/20">
                            <div className="space-y-4">
                                {threadMessages.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_user_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender_user_id !== currentUser.id && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getSenderInitial(msg.sender_name)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`rounded-lg px-4 py-2 max-w-sm break-words ${msg.sender_user_id === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 text-right ${msg.sender_user_id === currentUser.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                         {msg.sender_user_id === currentUser.id && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getSenderInitial(msg.sender_name)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input 
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Type a message..."
                                    autoComplete="off"
                                />
                                <Button type="submit" disabled={!messageContent.trim()}>
                                    <Icons.MessageSquare size={18} className="mr-2"/> Send
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <Icons.MessageSquare size={48} className="mx-auto mb-2" />
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
