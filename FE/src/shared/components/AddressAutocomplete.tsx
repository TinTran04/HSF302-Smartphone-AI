import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { api } from '../api';
import { ApiError } from '../api/httpClient';
import type { AddressSuggestion } from '../types/models';
import './AddressAutocomplete.css';

export interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (address: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
  className?: string;
}

type SearchState = {
  query: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  suggestions: AddressSuggestion[];
  message: string;
};

const emptySearch: SearchState = { query: '', status: 'idle', suggestions: [], message: '' };

export function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  disabled = false,
  required = false,
  minLength,
  maxLength,
  multiline = false,
  className = '',
}: AddressAutocompleteProps) {
  const id = useId();
  const listId = `${id}-suggestions`;
  const helpId = `${id}-help`;
  const statusId = `${id}-status`;
  const [search, setSearch] = useState<SearchState>(emptySearch);
  const [active, setActive] = useState(-1);
  const focused = useRef(false);
  // Only an input event authorizes a lookup; loading a saved address does not.
  const editedValue = useRef<string | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const controller = useRef<AbortController | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const current = useRef({ value, disabled });
  current.current = { value, disabled };

  function cancelPending() {
    generation.current++;
    clearTimeout(timer.current);
    timer.current = undefined;
    controller.current?.abort();
    controller.current = null;
  }

  function dismiss() {
    cancelPending();
    editedValue.current = null;
    setSearch(emptySearch);
    setActive(-1);
  }

  useEffect(() => {
    cancelPending();
    setSearch(emptySearch);
    setActive(-1);
    if (disabled || editedValue.current !== value) editedValue.current = null;
    const query = value.trim();
    if (!disabled && focused.current && editedValue.current === value && query.length >= 3) {
      const requestGeneration = generation.current;
      const isCurrent = () =>
        requestGeneration === generation.current &&
        !current.current.disabled &&
        focused.current &&
        editedValue.current === value &&
        current.current.value === value;

      timer.current = setTimeout(() => {
        if (!isCurrent()) return;
        const request = new AbortController();
        controller.current = request;
        setSearch({ query: value, status: 'loading', suggestions: [], message: '' });
        void api.addressSuggestions(query, request.signal).then(
          (suggestions) => {
            if (!isCurrent() || request.signal.aborted) return;
            setSearch({ query: value, status: 'ready', suggestions, message: '' });
          },
          (error: unknown) => {
            if (!isCurrent() || request.signal.aborted) return;
            const status = error instanceof ApiError ? error.status : 0;
            const message =
              status === 429
                ? 'Tạm hết lượt gợi ý địa chỉ. Bạn vẫn có thể nhập địa chỉ hoặc chọn điểm trên bản đồ.'
                : status === 503
                  ? 'Gợi ý địa chỉ đang tạm ngưng. Bạn vẫn có thể nhập địa chỉ hoặc chọn điểm trên bản đồ.'
                  : 'Chưa tải được gợi ý. Bạn vẫn có thể nhập địa chỉ hoặc chọn điểm trên bản đồ.';
            setSearch({ query: value, status: 'error', suggestions: [], message });
          },
        );
      }, 400);
    }
    return cancelPending;
  }, [value, disabled]);

  const open = !disabled && focused.current && search.query === value && search.status !== 'idle';
  const hasSuggestions = open && search.status === 'ready' && search.suggestions.length > 0;
  const activeId = hasSuggestions && active >= 0 ? `${listId}-${active}` : undefined;
  const message = !open
    ? ''
    : search.status === 'loading'
      ? 'Đang tìm địa chỉ…'
      : search.status === 'error'
        ? search.message
        : !search.suggestions.length
          ? 'Chưa tìm thấy địa chỉ phù hợp. Bạn vẫn có thể nhập thủ công.'
          : '';

  useEffect(() => {
    if (hasSuggestions && active >= 0)
      list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, hasSuggestions]);

  function select(suggestion: AddressSuggestion) {
    if (current.current.disabled) return;
    dismiss();
    // The parent updates text and coordinates together; plain onChange clears its old pin.
    onSelect(suggestion);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (disabled || event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      if (open || editedValue.current !== null) event.preventDefault();
      dismiss();
    } else if (hasSuggestions && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      const count = search.suggestions.length;
      setActive((index) =>
        event.key === 'ArrowDown'
          ? (index + 1) % count
          : (index < 0 ? count - 1 : index - 1 + count) % count,
      );
    } else if (hasSuggestions && event.key === 'Enter') {
      event.preventDefault();
      if (active >= 0) select(search.suggestions[active]);
    }
  }

  const fieldProps = {
    id,
    value,
    disabled,
    required,
    minLength,
    maxLength,
    autoComplete: 'off',
    role: 'combobox',
    'aria-autocomplete': 'list' as const,
    'aria-controls': listId,
    'aria-expanded': hasSuggestions,
    'aria-activedescendant': activeId,
    'aria-describedby': `${helpId}${message ? ` ${statusId}` : ''}`,
    onFocus: () => {
      focused.current = true;
    },
    onBlur: () => {
      focused.current = false;
      dismiss();
    },
    onChange: (event: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
      if (disabled) return;
      cancelPending();
      editedValue.current = event.currentTarget.value;
      setSearch(emptySearch);
      setActive(-1);
      onChange(event.currentTarget.value);
    },
    onKeyDown: handleKeyDown,
  };

  return (
    <div className={`form-field address-autocomplete ${className}`}>
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea {...fieldProps} rows={3} /> : <input {...fieldProps} type="text" />}
      <ul
        ref={list}
        id={listId}
        className="address-autocomplete-list"
        role="listbox"
        aria-label={`Gợi ý ${label.toLocaleLowerCase('vi')}`}
        hidden={!hasSuggestions}
      >
        {hasSuggestions &&
          search.suggestions.map((suggestion, index) => (
            <li key={suggestion.id} role="presentation">
              <button
                id={`${listId}-${index}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={active === index}
                className="address-autocomplete-option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => select(suggestion)}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
      </ul>
      {message && (
        <p id={statusId} className="help-text address-autocomplete-status" role="status">
          {message}
        </p>
      )}
      <p id={helpId} className="help-text address-autocomplete-help">
        Chọn gợi ý để ghim vị trí trên bản đồ, hoặc nhập địa chỉ thủ công.
      </p>
    </div>
  );
}
