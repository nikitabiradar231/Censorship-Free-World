import React from 'react';
import { ShieldCheck, HardDrive, Radio, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-900 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">FreePress</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                Ethereum Swarm
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A genuinely decentralized, censorship-resistant publishing platform for independent journalists like Divya. Content addressing and signed Swarm Feeds ensure reporting remains permanently available without single points of failure.
            </p>
            <p className="text-slate-500 text-[11px] italic">
              "Your Voice. Your Content. No Single Point of Failure."
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Decentralized Architecture
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ethereum Swarm Storage</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Single Owner Chunks (SOC)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Client-Side ECDSA Signing</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Ethereum Swarm Resources
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <a
                  href="https://www.ethswarm.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Swarm Network</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.ethswarm.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Bee Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://gateway.ethswarm.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Swarm Gateway</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            FreePress MVP &bull; Road to Devcon XI / Devcon 8 Build Battle &bull; Built with React 19, TypeScript &amp; bee-js.
          </div>
          <div>100% Static Frontend &bull; Zero Server Runtime &bull; Publisher Sovereignty</div>
        </div>
      </div>
    </footer>
  );
};

