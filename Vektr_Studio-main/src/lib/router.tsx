import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string, replace?: boolean) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function BrowserRouter({ children }: { children: ReactNode }) {
  // Use hash for routing (essential for Capacitor/Android compatibility)
  const getHashPath = () => window.location.hash.slice(1) || '/';
  const [path, setPath] = useState(getHashPath());

  useEffect(() => {
    const handleHashChange = () => setPath(getHashPath());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: string, replace = false) => {
    // Standardize 'to' to ensure it starts with /
    const cleanPath = to.startsWith('/') ? to : `/${to}`;
    if (replace) {
      window.location.replace(`#${cleanPath}`);
    } else {
      window.location.hash = cleanPath;
    }
    setPath(cleanPath);
  };

  return (
    <RouterContext.Provider value={{ path, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useNavigate must be used within BrowserRouter');
  return ctx.navigate;
}

export function useParams() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useParams must be used within BrowserRouter');
  return ctx.params;
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useLocation must be used within BrowserRouter');
  return { pathname: ctx.path };
}

// Internal context to pass down Outlet rendering
const OutletContext = createContext<ReactNode>(null);

export function Outlet() {
  return <>{useContext(OutletContext)}</>;
}

export function Navigate({ to, replace = true }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, replace);
  }, [navigate, to, replace]);
  return null;
}

export function NavLink({ 
  to, 
  end, 
  children, 
  className,
  onClick
}: { 
  to: string; 
  end?: boolean; 
  children: ReactNode | ((props: { isActive: boolean }) => ReactNode); 
  className?: string | ((props: { isActive: boolean }) => string);
  onClick?: (e: React.MouseEvent) => void;
}) {
  const ctx = useContext(RouterContext);
  const navigate = useNavigate();
  
  const isActive = ctx ? (end ? ctx.path === to : ctx.path.startsWith(to)) : false;
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented) {
      e.preventDefault();
      navigate(to);
    }
  };

  const computedClass = typeof className === 'function' ? className({ isActive }) : className;
  const renderedChildren = typeof children === 'function' ? children({ isActive }) : children;

  return (
    <a href={`#${to}`} onClick={handleClick} className={computedClass}>
      {renderedChildren}
    </a>
  );
}

// Route component - only holds props for Routes to read
export function Route(_props: { path?: string; element?: ReactNode; children?: ReactNode }) {
  return null;
}

// Helper to extract path params (e.g. /tracks/:id)
function matchRoute(routePath: string, currentPath: string): { matches: boolean; params: Record<string, string> } {
  // Normalize paths for matching
  const routeParts = routePath.split('/').filter(Boolean);
  const currentParts = currentPath.split('/').filter(Boolean);

  // Wildcard check
  if (routePath === '*') return { matches: true, params: {} };

  // Length match check (unless dynamic or wildcard)
  if (routeParts.length !== currentParts.length && !routePath.includes(':') && !routePath.endsWith('*')) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      const paramName = routeParts[i].slice(1);
      params[paramName] = currentParts[i] || '';
    } else if (routeParts[i] === '*') {
      return { matches: true, params };
    } else if (routeParts[i] !== currentParts[i]) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

interface RouteProps {
  path?: string;
  element?: ReactNode;
  children?: ReactNode;
}

export function Routes({ children }: { children: ReactNode }) {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('Routes must be used within BrowserRouter');

  let match: ReactNode = null;
  let extractedParams: Record<string, string> = {};

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    
    // Support fragments or direct Route components
    const props = child.props as RouteProps;

    if (props.path) {
      const { matches, params } = matchRoute(props.path, ctx.path);
      if (matches && !match) {
        match = props.element;
        extractedParams = params;
      }
    } else if (props.children && props.element) {
      // Nested layout route without a path (wrapper route like SovereignGuard)
      React.Children.forEach(props.children, (nestedChild) => {
        if (!React.isValidElement(nestedChild)) return;
        const nestedProps = nestedChild.props as RouteProps;
        if (nestedProps.path) {
          const { matches, params } = matchRoute(nestedProps.path, ctx.path);
          if (matches && !match) {
            match = (
              <OutletContext.Provider value={nestedProps.element}>
                {props.element}
              </OutletContext.Provider>
            );
            extractedParams = params;
          }
        }
      });
    }
  });

  // Inject params into the context for this specific matched route
  return (
    <RouterContext.Provider value={{ ...ctx, params: extractedParams }}>
      {match || <div className="p-20 text-center font-bold text-white/20">404 Sovereign Route Not Found</div>}
    </RouterContext.Provider>
  );
}
