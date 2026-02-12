'use client';

interface UIPage {
  name: string;
  route: string;
  status: 'done' | 'planned';
  mockup?: string;
}

interface UICategory {
  category: string;
  icon: string;
  pages: UIPage[];
}

interface PagesViewProps {
  uiPages: UICategory[];
}

export function PagesView({ uiPages }: PagesViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <h3 className="font-semibold text-emerald-900">UI Pages</h3>
              <p className="text-sm text-emerald-700">
                {uiPages.reduce((acc, cat) => acc + cat.pages.filter(p => p.status === 'done').length, 0)} of {uiPages.reduce((acc, cat) => acc + cat.pages.length, 0)} pages implemented
              </p>
            </div>
          </div>
          <a href="/design_mockups/index.html" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
            View All Mockups
          </a>
        </div>
      </div>

      {uiPages.map(category => {
        const doneCount = category.pages.filter(p => p.status === 'done').length;
        return (
          <div key={category.category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                </div>
                <span className={`text-sm font-medium ${doneCount === category.pages.length ? 'text-green-600' : 'text-gray-500'}`}>
                  {doneCount}/{category.pages.length} done
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {category.pages.map(page => {
                const isDone = page.status === 'done';
                const isClickable = isDone && !page.route.includes('[');
                return (
                  <div key={page.route} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDone ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium ${isDone ? 'text-gray-900' : 'text-gray-500'}`}>{page.name}</span>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{page.route}</code>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {page.mockup && (
                          <a href={`/design_mockups/${page.mockup}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors">
                            Mockup
                          </a>
                        )}
                        {isClickable ? (
                          <a href={page.route} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-medium">
                            Open Page
                          </a>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded ${isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isDone ? 'Done' : 'Planned'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
