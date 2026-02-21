import { useState, useEffect } from 'react';
import { BookOpen, FileText, Download } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  file: string;
  skill_file?: string;
  size_kb: number;
}

interface KnowledgeData {
  version: string;
  updated: string;
  knowledge_base: KnowledgeItem[];
}

export default function KnowledgePage() {
  const [data, setData] = useState<KnowledgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/knowledge/index.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: KnowledgeData) => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">加载失败: {error}</div>
      </div>
    );
  }

  if (!data || !data.knowledge_base || data.knowledge_base.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">知识库</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            版本 {data.version} · 更新于 {data.updated}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {data.knowledge_base.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{item.tagline}</p>
                  <p className="text-gray-600 mt-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">{item.size_kb}KB</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <a
                  href={item.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <FileText className="w-4 h-4" />
                  查看文档
                </a>
                {item.skill_file && (
                  <a
                    href={item.skill_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    下载技能包
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
