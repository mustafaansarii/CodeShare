import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
import 'monaco-editor/min/vs/editor/editor.main.css';
import Editor from "@monaco-editor/react";
import config from '../config';
import { AppBar, Toolbar, Select, MenuItem, Button, Link, Box, Typography } from '@mui/material';
import { Code, ArrowBack, Share, FilePresent, Edit } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

const TextEditors = () => {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isOwner, setIsOwner] = useState(true);
  const [language, setLanguage] = useState(null);
  const [leftWidth, setLeftWidth] = useState('50%');
  const [isRunning, setIsRunning] = useState(false);
  const dividerRef = useRef(null);
  const editorRef = useRef(null);
  const [file_name, setFileName] = useState('');
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const lastSavedContentRef = useRef(null);

  useEffect(() => {
    const fetchDocument = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        const selectedLanguage = data.language || 'python';
        setLanguage(selectedLanguage);

        let contentForLanguage = data.language_content?.[selectedLanguage];
        if (!contentForLanguage) {
          if (selectedLanguage === 'java') {
            contentForLanguage = `import java.util.*;
import java.io.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from java!");
    }
}
`;
          } else if (selectedLanguage === 'python') {
            contentForLanguage = 'print("hello world")';
          } else if (selectedLanguage === 'other') {
            contentForLanguage = '';
          }
        }

        setContent(contentForLanguage);
        setIsOwner(data.user_id === session?.user?.id);
        setFileName(data.file_name);
      }
    };

    fetchDocument();
  }, [id]);

  useEffect(() => {
    const channel = supabase
      .channel(`document-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (!payload.new.language_content) return;

          const lang = payload.new.language;
          const incomingContent = payload.new.language_content?.[lang];

          if (incomingContent === lastSavedContentRef.current) return;

          if (lang) setLanguage(lang);
          if (incomingContent !== undefined) setContent(incomingContent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleChange = async (value) => {
    if (!language) {
      toast.error('You are in read-only mode.');
      return;
    }
    if (!isOwner) {
      toast.error('You are in read-only mode.');
      return;
    }
    setContent(value);
    if (isOwner) {
      try {
        const { data: currentDocument } = await supabase
          .from('documents')
          .select('language_content, file_name')
          .eq('id', id)
          .single();

        // Update the language_content for the current language
        const updatedLanguageContent = {
          ...(currentDocument.language_content || {}),
          [language]: value,
        };

        // Track what we're saving so we can ignore our own realtime echo
        lastSavedContentRef.current = value;

        // Save the updated language_content and file_name
        const { error } = await supabase
          .from('documents')
          .update({ language_content: updatedLanguageContent, language: language, file_name: id })
          .eq('id', id);

        if (error) {
          toast.error('Failed to save content: ' + error.message);
        }
      } catch (error) {
        toast.error('Failed to save content: ' + error.message);
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleLanguageChange = async (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);

    // Fetch the current language_content
    const { data: currentDocument } = await supabase
      .from('documents')
      .select('language_content')
      .eq('id', id)
      .single();

    // Set the content for the selected language
    let contentForLanguage = currentDocument.language_content?.[selectedLanguage];

    // If no content exists for the selected language, set hardcoded default code
    if (!contentForLanguage) {
      if (selectedLanguage === 'java') {
        contentForLanguage = `import java.util.*;
import java.io.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from java!");
    }
}
`;
      } else if (selectedLanguage === 'python') {
        contentForLanguage = 'print("hello world")';
      } else if (selectedLanguage === 'other') {
        contentForLanguage = '';
      }
    }

    setContent(contentForLanguage);

    if (isOwner) {
      try {
        const { error } = await supabase
          .from('documents')
          .update({ language: selectedLanguage })
          .eq('id', id);
        if (error) {
          toast.error('Failed to save language: ' + error.message);
        }
      } catch (error) {
        toast.error('Failed to save language: ' + error.message);
      }
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const container = dividerRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(`${Math.min(Math.max(newLeftWidth, 20), 80)}%`);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const apiEndpoint = language === 'java' ? config.javaApi : language === 'python' ? config.pythonApi : null;
      if (!apiEndpoint) {
        setOutput("Language not supported");
        return;
      }
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: content,
          input: input
        })
      });
      const data = await response.json();
      if (data.error) {
        setOutput(data.error);
      } else {
        setOutput(
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">Time:</span>
              <span>{data.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">Memory:</span>
              <span>{data.memory}</span>
            </div>
            <div className="mt-4">
              {data.output}
            </div>
          </div>
        );
      }
    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('keydown', (e) => {
        if (!language) {
          console.log('Please select a language before writing code.');
        } else if (!isOwner) {
          console.log('You are in read-only mode. Cannot edit in read-only view.');
        }
      });
    }
  }

  const handleShareClick = () => {
    const url = window.location.href; // Get the current URL
    navigator.clipboard.writeText(url) // Copy the URL to the clipboard
      .then(() => {
        toast.success('Copied URL'); // Show success toast
      })
      .catch(() => {
        toast.error('Failed to copy URL'); // Show error toast if copying fails
      });
  };

  const handleFileNameChange = (e) => {
    setNewFileName(e.target.value);
  };

  const handleSaveFileName = async () => {
    if (!isOwner) {
      toast.error('You are in read-only mode.');
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .update({ file_name: newFileName })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update file name: ' + error.message);
      } else {
        setFileName(newFileName);
        setIsEditingFileName(false);
        toast.success('File name updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update file name: ' + error.message);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-700">
      <Toaster />
      <AppBar position="static" sx={{ backgroundColor: '#000000', height: '40px' }}>
        <Toolbar sx={{ minHeight: '40px' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', marginTop: '-15px', marginRight: '10px', alignItems: 'center' }}>
              <ArrowBack />
            </Link>
            <Select
              value={language || ''}
              onChange={handleLanguageChange}
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: '#1A1A1A',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333333',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#666666',
                },
                height: '24px',
                fontSize: '0.75rem',
                padding: '0 8px',
                marginTop: '-15px',
              }}
            >
              <MenuItem value="python" sx={{ fontSize: '0.75rem', color: 'black' }}>Python</MenuItem>
              <MenuItem value="java" sx={{ fontSize: '0.75rem', color: 'black' }}>Java</MenuItem>
              <MenuItem value="other" sx={{ fontSize: '0.75rem', color: 'black' }}>Other</MenuItem>
            </Select>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              borderRadius: '4px',
              padding: '4px 8px',
              marginTop: '-20px',
              border: '1px solid #333333',
              '&:hover .edit-icon': {
                display: 'inline-block',
              },
            }}>
              <FilePresent fontSize="small" sx={{ color: '#666666', marginRight: '8px' }} />
              {isEditingFileName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={handleFileNameChange}
                    className="bg-gray-900 text-white p-1 rounded"
                    style={{ width: '150px' }}
                  />
                  <Button
                    onClick={handleSaveFileName}
                    size="small"
                    sx={{ color: 'white', fontSize: '0.75rem' }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditingFileName(false)}
                    size="small"
                    sx={{ color: 'white', fontSize: '0.75rem' }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'white', fontSize: '0.75rem' }}>
                    File Name: {file_name || id}
                  </Typography>
                  <Edit
                    className="edit-icon"
                    fontSize="small"
                    sx={{ color: '#666666', marginLeft: '8px', display: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      setNewFileName(file_name || id);
                      setIsEditingFileName(true);
                    }}
                  />
                </Box>
              )}
            </Box>

            <Button
              onClick={handleRunCode}
              disabled={isRunning || !language || language === 'other'}
              variant="contained"
              size="small"
              startIcon={<Code fontSize="small" />}
              sx={{
                backgroundColor: '#2563EB',
                '&:hover': { backgroundColor: '#1D4ED8' },
                '&:disabled': { backgroundColor: '#666666' },
                height: '30px',
                marginTop: '-20px',
              }}
            >
              {isRunning ? 'Running...' : 'Run'}
            </Button>

          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
            <Button
              href="/files"
              variant="text"
              startIcon={<FilePresent fontSize="small" />}
              sx={{
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 500,
                marginTop: '-15px',
              }}
            >
              My Files
            </Button>
            <Button
              onClick={handleShareClick}
              variant="text"
              startIcon={<Share fontSize="small" />}
              sx={{
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 500,
                marginTop: '-15px',
              }}
            >
              Share
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <div className="flex flex-1 flex-col md:flex-row" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="w-full md:w-auto" style={{ width: leftWidth, minWidth: '20%', height: '100%' }}>
          <Editor
            height="100%"
            width="100%"
            language={language || ''}
            value={content}
            onChange={handleChange}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              readOnly: !isOwner || !language,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              wrappingStrategy: 'advanced',
              wrappingIndent: 'indent',
              lineNumbers: 'on',
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto'
              },
              automaticLayout: true,
              highlightActiveIndentGuide: true,
              renderLineHighlight: 'all',
              roundedSelection: false,
              showFoldingControls: false,
              glyphMargin: false,
              folding: false,
              codeLens: false,
              showUnused: false,
              renderValidationDecorations: "off",
              suggest: {
                enabled: true,
                showWords: true,
                showSnippets: true,
                showFiles: true,
                showClasses: true,
                showFunctions: true,
                showVariables: true,
                showStructs: true,
                showInterfaces: true
              },
              quickSuggestions: true,
              parameterHints: {
                enabled: true
              }
            }}
          />
        </div>
        <div
          ref={dividerRef}
          className="w-1 bg-gray-700 cursor-col-resize hover:bg-blue-500 hidden md:block"
          onMouseDown={handleMouseDown}
        />
        <div className="flex-1 flex flex-col p-4 bg-gray-950 md:max-w-[50%]">
          <div className="flex-1 mb-4 md:mb-0">
            <h3 className="text-gray-200 mb-2 text-sm">Input</h3>
            <textarea
              value={input}
              onChange={handleInputChange}
              className="w-full h-24 md:h-32 p-2 border border-gray-700 text-gray-200 rounded-lg bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter input here..."
            />
            <p className="text-gray-400 text-xs mt-1">If your code takes input, add it in the above box before running.</p>
          </div>
          <div className="flex-1">
            <h3 className="text-gray-200 mb-2 text-sm">Output</h3>
            <pre className="w-full h-40 md:h-64 p-2 border border-gray-700 text-gray-200 rounded-lg bg-gray-900 overflow-auto text-sm">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditors;