export type SearchMatch = {
  path: string;
  name: string;
  line: number;
  text: string;
};

type SearchResult = {
  matches: SearchMatch[];
  truncated: boolean;
};

export default SearchResult;
