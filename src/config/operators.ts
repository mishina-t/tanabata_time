export type OperatorSlot = {
  id: string;
  name: string;
  codeHash: string;
};

// Names can be replaced once the five operators are decided.
export const operatorSlots: OperatorSlot[] = [
  { id: "admin", name: "管理者", codeHash: "1abd2bf13554c6ce0ea57a170f795af86b78e1bc86296f70d29aa89895e9897a" },
  { id: "operator-2", name: "運営2", codeHash: "cd6a5fa07ff6aa5241ff78989bee37cea787e463dc9f5a124d74791b6caa83fb" },
  { id: "operator-3", name: "運営3", codeHash: "f1b49b506e745dead2ceec4e66e05a28d679b0fda24be119b229315970f47cd0" },
  { id: "operator-4", name: "運営4", codeHash: "3f0e8c44329b01687b08bd9c4220479dafae1184e5f6f3c1888175cc0363a47d" },
  { id: "operator-5", name: "運営5", codeHash: "f295f8f0c6dd8ddc8a8e24ae5f8ab601bfc623d62f1725afa4ffd094067fb85b" },
];
