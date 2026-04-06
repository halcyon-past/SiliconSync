export class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.indices = []; // Store indices of news items matching this prefix
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, index) {
    let node = this.root;
    const lowerWord = word.toLowerCase();
    for (const char of lowerWord) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
      // Store index at each node for prefix matching
      if (!node.indices.includes(index)) {
        node.indices.push(index);
      }
    }
    node.isEndOfWord = true;
  }

  search(prefix) {
    let node = this.root;
    const lowerPrefix = prefix.toLowerCase();
    for (const char of lowerPrefix) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return node.indices;
  }
}
