import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js';
import 'monaco-editor/min/vs/editor/editor.main.css';
import Editor from "@monaco-editor/react";
import Navbar from './Navbar';

const TextEditor = () => {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch the document
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setContent(data.content);
        // Check if current user is the owner
        setIsOwner(data.user_id === session?.user?.id);
      }
    };

    fetchDocument();
  }, [id]);

  const handleChange = async (value) => {
    setContent(value);
    if (isOwner) {
      await supabase
        .from('documents')
        .update({ content: value })
        .eq('id', id);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 relative z-10" style={{ height: 'calc(100vh - 64px)' }}>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="javascript"
          value={content}
          onChange={handleChange}
          theme="vs-dark"
          options={{ 
            readOnly: !isOwner,
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
            renderValidationDecorations: "off"
          }}
        />
      </div>
    </div>
  );
};

export default TextEditor;