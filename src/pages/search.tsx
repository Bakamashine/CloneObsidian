import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CloseIcon, FileIcon, SearchIcon } from "../components/icons";
import type SearchResult from "../interface/SearchResult";
import type { SearchMatch } from "../interface/SearchResult";
import { useTabs } from "../tabs";

const EMPTY_RESULTS: SearchResult = { matches: [], truncated: false };

type SearchGroup = {
  name: string;
  path: string;
  matches: SearchMatch[];
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  const term = query.trim();
  if (!term) return <>{text}</>;

  const lowerTerm = term.toLowerCase();
  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === lowerTerm ? (
          <mark key={index}>{part}</mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

const SearchPage = () => {
  const { openTab } = useTabs();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>(EMPTY_RESULTS);
  const [searching, setSearching] = useState(false);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setResults(EMPTY_RESULTS);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    const timeout = window.setTimeout(() => {
      window.userFiles
        .search(trimmedQuery)
        .then((next) => {
          if (cancelled) return;
          setResults(next);
          setSearching(false);
        })
        .catch(() => {
          if (cancelled) return;
          setResults(EMPTY_RESULTS);
          setSearching(false);
        });
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  const groups = useMemo(() => {
    const byPath = new Map<string, SearchGroup>();

    for (const match of results.matches) {
      const group = byPath.get(match.path);
      if (group) {
        group.matches.push(match);
      } else {
        byPath.set(match.path, {
          name: match.name,
          path: match.path,
          matches: [match],
        });
      }
    }

    return [...byPath.values()];
  }, [results]);

  const openMatch = (match: SearchMatch) => {
    openTab({ name: match.name, path: match.path, line: match.line });
    navigate("/");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery("");
      return;
    }

    if (event.key === "Enter" && results.matches.length > 0) {
      event.preventDefault();
      openMatch(results.matches[0]);
    }
  };

  return (
    <div className="search-page">
      <div className="search-page__header">
        <div className="search-page__input-wrapper">
          <SearchIcon size={16} />
          <input
            className="search-page__input"
            type="text"
            placeholder="Search notes…"
            aria-label="Search notes"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              className="icon-button"
              type="button"
              title="Clear search"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <CloseIcon size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="search-page__body">
        <div className="search-page__content">
          {!trimmedQuery ? (
            <div className="search-page__status">
              <SearchIcon size={28} className="search-page__status-icon" />
              <p className="search-page__status-title">Search your notes</p>
              <p className="search-page__status-text">
                Find text across every note in your vault. Results update as you
                type.
              </p>
            </div>
          ) : searching && results.matches.length === 0 ? (
            <div className="search-page__status">
              <p className="search-page__status-title">Searching…</p>
            </div>
          ) : results.matches.length === 0 ? (
            <div className="search-page__status">
              <SearchIcon size={28} className="search-page__status-icon" />
              <p className="search-page__status-title">No matches found</p>
              <p className="search-page__status-text">
                Nothing matches “{trimmedQuery}”. Try a different search.
              </p>
            </div>
          ) : (
            <>
              <p className="search-page__summary">
                {results.matches.length}
                {results.truncated ? "+" : ""}{" "}
                {results.matches.length === 1 ? "match" : "matches"} in{" "}
                {groups.length} {groups.length === 1 ? "file" : "files"}
                {results.truncated && " (showing the first 200)"}
              </p>

              {groups.map((group) => (
                <section className="search-group" key={group.path}>
                  <button
                    className="search-group__header"
                    type="button"
                    title={`Open ${group.path}`}
                    onClick={() => openMatch(group.matches[0])}
                  >
                    <span className="search-group__icon">
                      <FileIcon size={14} />
                    </span>
                    <span className="search-group__name">{group.name}</span>
                    {group.path !== group.name && (
                      <span className="search-group__path">{group.path}</span>
                    )}
                  </button>

                  {group.matches.map((match) => (
                    <button
                      className="search-match"
                      type="button"
                      key={`${match.path}:${match.line}`}
                      title={`${match.path}:${match.line}`}
                      onClick={() => openMatch(match)}
                    >
                      <span className="search-match__line">{match.line}</span>
                      <span className="search-match__text">
                        <HighlightedText
                          text={match.text}
                          query={trimmedQuery}
                        />
                      </span>
                    </button>
                  ))}
                </section>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
