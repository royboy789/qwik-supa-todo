import { component$, QRL, $, useStore } from '@builder.io/qwik';

export interface AutoCompleteProps {
  options: string[];
  onSelect$: QRL<(value: string) => void>;
  placeholder?: string;
}

const AutoComplete = component$<AutoCompleteProps>(({ placeholder, options, onSelect$ }) => {
  const searchResults = useStore<{results: string[]}>({results: []})

  const initSearch = $((keyCode: number) => {
    if( keyCode < 65 || keyCode > 90 ) {
      return;
    }
    
    const value = `${(document.getElementById('autocomplete-input') as HTMLInputElement)?.value}`;

    if(value.length < 2 ) {
      searchResults.results = [];
      return;
    }
    searchResults.results = options.filter((option) =>  -1 !== option.toLowerCase().search(value.toLowerCase()) );
  })

  
  return (
    <form class="autocomplete-wrapper my-2 relative" preventdefault:submit onSubmit$={() => onSelect$(`${(document.getElementById('autocomplete-input') as HTMLInputElement).value}`) }>
      <input id="autocomplete-input" placeholder={placeholder || ''} onKeyDown$={(e) => initSearch(e.keyCode)} class="p-2 border border-black rounded-sm text-sm w-full" />
      {searchResults.results.length > 0 && (
        <ul class="absolute left-0 top-full bg-white w-full drop-shadow-md">
          {searchResults.results.map((result) => <li class="p-2 cursor-pointer border border-transparent hover:border-gray-400" onClick$={() => {
            onSelect$(result);
            searchResults.results = [];
            (document.getElementById('autocomplete-input') as HTMLInputElement).value = '';
          }}>{result}</li>)}
        </ul>
      )}
    </form>
  );
});

export default AutoComplete;