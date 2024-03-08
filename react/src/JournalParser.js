import React, { useEffect, useMemo, useState } from 'react';
import { JSONTree } from "react-json-tree";
import Markdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rangeParser from 'parse-numeric-range';

import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';

SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('python', python);

const DEFAULT_REGISTRY = 'https://raw.githubusercontent.com/cameronfyfe/risc0-journal-parser-registry/main/registry.json';

const cssPrefix = "risc-zero-journal-parser";

function cssClass(className) {
  return `${cssPrefix}-${className}`;
}

function JournalParser({
  guestCodeId,
  journalBytes,
  registryUrl = DEFAULT_REGISTRY,
  ipfsGateway = "https://ipfs.io",
}) {
  const journalBytesString = useMemo(() =>
    journalBytes ? JSON.stringify(Array.from(journalBytes)) : null,
    [journalBytes]
  );

  const [registry, setRegistry] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(registryUrl);
        const json = await response.json();
        setRegistry(json);
      } catch {
        setRegistry(null);
      }
    })();
  }, [registryUrl]);

  const parsers = useMemo(() => {
    if (registry && guestCodeId) {
      return registry.parsers.filter((parser) =>
        parser.guestCodeId === guestCodeId
      );
    } else {
      return [];
    }
  }, [registry, guestCodeId]);

  const [selectedParserIndex, setSelectedParserIndex] = useState(undefined);

  useEffect(() => {
    if (parsers && parsers.length > 0) {
      setSelectedParserIndex(0);
    } else {
      setSelectedParserIndex(undefined);
    }
  }, [parsers]);

  const selectedParser = useMemo(
    () => selectedParserIndex != undefined ? parsers[selectedParserIndex] : null,
    [parsers, selectedParserIndex],
  );

  const wasmEntryUrl = useMemo(
    () =>
      selectedParser
        ? selectedParser.journalParser.protocol === "ipfs"
          ? `${ipfsGateway}/ipfs/${selectedParser.journalParser.src}`
          : null
        : null,
    [selectedParser],
  );

  const [wasmModule, setWasmModule] = useState(null);
  useEffect(() => {
    if (wasmEntryUrl) {
      (async () => {
        // TODO: This is a hack to get around the fact that import() doesn't work with dynamic URLs
        //       when webpack/babel are configured to statically resolve imports.
        //       It's easy to disable globally in .babelrc, but then the
        //       'import("@eqtylab/risc-zero-verifier")' in Verifier.js breaks.
        //       This hack works for now but is not ideal. We need to be careful what the value of
        //       wasmEntryUrl is to use this method with eval().
        const wm = await eval(`import("${wasmEntryUrl}")`);
        await wm.default();
        setWasmModule(wm);
      })();
    } else {
      setWasmModule(null);
    }
  }, [wasmEntryUrl]);

  const getJsonObjectFromReceiptBinary = useMemo(() =>
    wasmModule && wasmModule.json_obj_from_journal_bytes || null,
    [wasmModule]
  );

  const getStatementFromReceiptBinary = useMemo(() =>
    wasmModule && wasmModule.statement_from_journal_bytes || null,
    [wasmModule]
  );

  const [journalObj, setJournalObj] = useState(null);
  useEffect(() => {
    (async () => {
      if (journalBytes && getJsonObjectFromReceiptBinary) {
        try {
          const obj = await getJsonObjectFromReceiptBinary(journalBytes);
          setJournalObj(obj);
        } catch {
          setJournalObj(null);
        }
      } else {
        setJournalObj(null);
      }
    })();
  }, [journalBytes, getJsonObjectFromReceiptBinary]);

  const [statement, setStatement] = useState(null);
  useEffect(() => {
    (async () => {
      if (journalBytes && getStatementFromReceiptBinary) {
        try {
          const stmt = await getStatementFromReceiptBinary(journalBytes);
          setStatement(stmt);
        } catch {
          setStatement(null);
        }
      } else {
        setStatement(null);
      }
    })();
  }, [journalBytes, getStatementFromReceiptBinary]);

  const markdownComponents = {
    code({ node, inline, className, ...props }) {
      const hasLang = /language-(\w+)/.exec(className || '');
      const hasMeta = node?.data?.meta;

      const applyHighlights = (applyHighlights) => {
        if (hasMeta) {
          const RE = /{([\d,-]+)}/;
          const metadata = node.data.meta?.replace(/\s/g, '');
          const strlineNumbers = RE?.test(metadata)
            ? RE?.exec(metadata)[1]
            : '0';
          const highlightLines = rangeParser(strlineNumbers);
          const highlight = highlightLines;
          const data = highlight.includes(applyHighlights)
            ? 'highlight'
            : null;
          return { data };
        } else {
          return {};
        }
      };

      const showLineNumbers = !["language-bash", "language-json"].includes(className);

      return hasLang ? (
        <SyntaxHighlighter
          style={oneDark}
          language={hasLang[1]}
          PreTag="div"
          className="codeStyle"
          showLineNumbers={showLineNumbers}
          wrapLines={hasMeta}
          useInlineStyles={true}
          lineProps={applyHighlights}
        >
          {props.children}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props} />
      )
    },
  }

  return (
    <div>
      Journal Parser:
      <br />
      {guestCodeId ? (
        <select
          value={selectedParserIndex}
          onChange={(e) => setSelectedParserIndex(e.target.value)}
        >
          {parsers.map((parser, i) => (
            <option key={i} value={i}>
              {parser.profile.name} {parser.profile.version}
            </option>
          ))}
        </select>
      ) : (
        <p><i>No parsers available for this guest code id.</i></p>
      )}

      <br /><br />

      {statement &&
        <div>
          Statement:
          <br />
          <Markdown
            className={cssClass("statement-markdown")}
            components={markdownComponents}
          >
            {statement}
          </Markdown>
        </div>
      }

      <br /><br />

      {journalObj &&
        <div>
          Journal (JSON):
          <br />
          <div>
            <JSONTree data={journalObj} />
          </div>
        </div>
      }

      <br /><br />

      {journalBytesString &&
        <div>
          Journal (RAW):
          <br />
          <textarea className={cssClass("journal-raw")}
            value={journalBytesString}
            readOnly={true}
          />
        </div>
      }

    </div>
  );
}

export default JournalParser;
