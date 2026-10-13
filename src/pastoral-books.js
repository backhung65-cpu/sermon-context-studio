let cache;

export async function loadPastoralBooks(fetcher = fetch) {
  if (!cache) {
    cache = fetcher('/public/data/pastoral-books.json').then((response) => {
      if (!response.ok) throw new Error(`Pastoral book data request failed: ${response.status}`);
      return response.json();
    }).catch((error) => {
      cache = undefined;
      throw error;
    });
  }
  return cache;
}

export function selectPastoralBookGuide(data, code) {
  return data?.books?.find((book) => book.code === code) || null;
}

export function resetPastoralBooksCache() {
  cache = undefined;
}

