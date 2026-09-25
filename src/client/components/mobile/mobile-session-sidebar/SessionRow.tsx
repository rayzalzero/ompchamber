import { Check, Loader2, MoreHorizontal } from 'lucide-preact';
import type { SessionItemData } from '@/shared/types';
import { useInlineRename } from '@/client/hooks/ui/inline-rename';
import { SessionActionsMenu, useRowMenu } from '@/client/components/common/session-actions-menu';

export interface MobileSessionRowProps {
  session: SessionItemData;
  isActive: boolean;
  status?: 'stream' | 'finish' | 'abort';
  /** Relative age of the session, or null when no usable timestamp exists. */
  timeAgo: string | null;
  showTreeGlyph?: boolean;
  onSelect: () => void;
  onArchive: () => void;
  /** Omitted for a session that cannot be deleted yet (a pending `new-…` chat,
   *  which has no transcript anywhere). */
  onDelete?: () => void;
  onRename?: (name: string) => void;
}

export function MobileSessionRow({
  session,
  isActive,
  status,
  timeAgo,
  showTreeGlyph = false,
  onSelect,
  onArchive,
  onDelete,
  onRename,
}: MobileSessionRowProps) {
  const {
    isEditing,
    draft,
    setDraft,
    inputRef,
    startRename,
    handleKeyDown,
    handleBlur,
  } = useInlineRename(session.title, onRename);
  // One trigger for every row action; also reachable by long-press contextmenu.
  const menu = useRowMenu();
  const hasActions = Boolean(onRename || onArchive || onDelete);

  if (isEditing) {
    return (
      <div className="w-full rounded-lg flex items-center bg-ink/10">
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 min-w-0 mx-2 my-1.5 bg-paper border border-ink/25 rounded px-2 py-1 text-xs text-ink outline-none focus:border-ink/50"
        />
      </div>
    );
  }

  return (
    <>
      <div
        onContextMenu={hasActions ? menu.openAtCursor : undefined}
        className={`w-full rounded-lg flex items-center transition-colors ${
          isActive ? 'bg-ink/10 font-medium text-ink' : 'hover:bg-ink/5 text-ink/85'
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-left px-3 py-2 flex items-center justify-between min-w-0"
        >
          <div className="flex items-center space-x-1.5 min-w-0 pr-2">
            <span className="w-4 flex-shrink-0 flex items-center justify-center">
              {status === 'stream' && <Loader2 size={13} className="text-ink/50 animate-spin" />}
              {(status === 'finish' || status === 'abort') && <Check size={13} className="text-ink/50" />}
            </span>
            {showTreeGlyph && <span className="text-ink/40 text-xs flex-shrink-0 font-mono">&gt;</span>}
            <span className="text-xs truncate leading-snug">
              {session.title.charAt(0).toUpperCase() + session.title.slice(1)}
            </span>
          </div>

          <span className="text-[11px] text-ink/45 font-mono flex-shrink-0 ml-2">{timeAgo ?? ''}</span>
        </button>

        {/* Always visible, unlike the desktop row's hover-revealed trigger: a
            touch surface has no hover, and the three always-on action buttons
            this replaced consumed a third of a phone's row width. */}
        {hasActions && (
          <button
            type="button"
            onClick={menu.openBelow}
            title="Session actions"
            aria-label="Session actions"
            aria-haspopup="menu"
            aria-expanded={menu.anchor !== null}
            className="flex-shrink-0 p-2 mr-1 text-ink/35 hover:text-ink rounded-lg cursor-pointer"
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>

      {menu.anchor && (
        <SessionActionsMenu
          anchor={menu.anchor}
          isArchived={session.is_archived === 1}
          onRename={onRename ? startRename : undefined}
          onArchive={onArchive}
          onDelete={onDelete}
          onClose={menu.close}
        />
      )}
    </>
  );
}
