const fs = require('fs');

let code = fs.readFileSync('src/pages/SamplerStudio.tsx', 'utf8');

// Container
code = code.replace(
  '<div className="flex-1 flex flex-col lg:flex-row bg-[#030303] text-white h-full overflow-hidden relative">',
  '<div className="flex-1 overflow-y-auto h-full"><div className="flex flex-col lg:flex-row gap-6 h-full p-4 md:p-8 pb-24 md:pb-12 relative bg-transparent text-black">'
);

// End tags
if (!code.includes('</div></div>\n  );\n}')) {
  code = code.replace(
    '    </div>\n  );\n}\n',
    '    </div></div>\n  );\n}\n'
  );
  code = code.replace(
    '    </div>\r\n  );\r\n}\r\n',
    '    </div></div>\r\n  );\r\n}\r\n'
  );
}

// Background glow
code = code.replace('bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]', '');
code = code.replace('bg-amber-500/5', 'bg-amber-500/15');
code = code.replace('bg-violet-500/5', 'bg-violet-500/15');

// Left panel
code = code.replace(
  '<div className="flex-1 flex flex-col p-6 lg:p-10 relative z-10 overflow-y-auto">',
  '<div className="flex-1 flex flex-col bg-white border border-line shadow-sm rounded-[2.5rem] p-6 lg:p-10 relative z-10 overflow-hidden">'
);

// Right panel
code = code.replace(
  '<div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/[0.06] flex flex-col relative z-10 bg-white/[0.02] backdrop-blur-sm">',
  '<div className="w-full lg:w-80 xl:w-96 flex flex-col relative z-10 space-y-6 overflow-y-auto">'
);

// Right panel blocks
code = code.replace(
  'className="flex flex-col h-full"',
  'className="flex flex-col h-full bg-white border border-line shadow-sm rounded-[2.5rem] overflow-hidden"'
);
code = code.replace(
  'className="flex flex-col h-full p-6"',
  'className="flex flex-col h-full p-6 bg-white border border-line shadow-sm rounded-[2.5rem] overflow-hidden"'
);

// Typography and Colors
code = code.replace(/text-white\/30/g, 'text-muted');
code = code.replace(/text-white\/20/g, 'text-muted');
code = code.replace(/text-white\/40/g, 'text-muted');
code = code.replace(/text-white\/70/g, 'text-muted');
code = code.replace(/text-white\/80/g, 'text-black');
code = code.replace(/text-white\/90/g, 'text-black');
code = code.replace(/text-white/g, 'text-black');

code = code.replace(/bg-white\/\[0\.02\]/g, 'bg-gray-50');
code = code.replace(/bg-white\/\[0\.03\]/g, 'bg-gray-50');
code = code.replace(/bg-white\/\[0\.04\]/g, 'bg-gray-50');
code = code.replace(/bg-white\/\[0\.06\]/g, 'bg-gray-100');
code = code.replace(/bg-white\/\[0\.08\]/g, 'bg-gray-200');

code = code.replace(/border-white\/\[0\.06\]/g, 'border-line');
code = code.replace(/border-white\/\[0\.07\]/g, 'border-line');
code = code.replace(/border-white\/10/g, 'border-line');
code = code.replace(/border-white\/5/g, 'border-line');

code = code.replace(/bg-white\/5/g, 'bg-gray-50');
code = code.replace(/bg-white\/10/g, 'bg-gray-100');
code = code.replace(/bg-white\/20/g, 'bg-gray-200');

// Fix text-black that shouldn't be
code = code.replace('text-black h-full overflow-hidden', 'text-black overflow-hidden'); 
code = code.replace('bg-black/30 text-black', 'bg-black text-white');
// The record button fill
code = code.replace('text-red-500 fill-red-500', 'text-red-500 fill-red-500');

fs.writeFileSync('src/pages/SamplerStudio.tsx', code);
console.log('Done SamplerStudio');
