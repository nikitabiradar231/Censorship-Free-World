import React from 'react';
import {
  ShieldAlert,
  ServerOff,
  Globe,
  Database,
  HardDrive,
  KeyRound,
  Stamp,
  Radio,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface ThreatPoint {
  id: string;
  name: string;
  icon: any;
  controller: string;
  failureMode: string;
  attackVector: string;
  mitigation: string;
  residualRisk: string;
}

export const Security: React.FC = () => {
  const threatPoints: ThreatPoint[] = [
    {
      id: 'hosting',
      name: '1. Hosting Provider',
      icon: ServerOff,
      controller: 'Cloud providers (AWS, Vercel, Netlify, DigitalOcean)',
      failureMode: 'Account suspension, terms-of-service cancellation, or server de-provisioning upon receiving legal demands or court orders.',
      attackVector: 'Government subpoenas, copyright notices, or corporate pressure targeting the hosting firm.',
      mitigation: 'FreePress compiles to 100% static assets (HTML/JS/CSS). The app can be hosted simultaneously on Swarm itself (as a bzz website), IPFS, GitHub Pages, or run locally from disk as a file without any hosting account.',
      residualRisk: 'A single commercial host can still block its specific URL; users are encouraged to run local copies or access via Swarm bzz hashes.',
    },
    {
      id: 'domain',
      name: '2. Domain Registrar',
      icon: Globe,
      controller: 'ICANN, Registry operators (.com, .org, ccTLDs), and Registrars (GoDaddy, Namecheap)',
      failureMode: 'Domain seizure, court-ordered DNS suspension, or account lock preventing domain resolution.',
      attackVector: 'DNS registry lock or injunction against the registrar.',
      mitigation: 'Permanent links do NOT depend on the developer domain. FreePress permanent addresses are constructed from the Swarm Feed identity (0x<owner>/0x<topic>) and native bzz:// protocol URIs, which can be resolved through any gateway.',
      residualRisk: 'Readers who only remember a traditional domain will fail to connect if it is seized; they must bookmark the feed identity or use ENS.',
    },
    {
      id: 'builder-server',
      name: '3. Application Developer Server',
      icon: Database,
      controller: 'FreePress project developers / maintainers',
      failureMode: 'If the developer server is arrested, raided, abandoned, or shut down, apps relying on builder APIs die immediately.',
      attackVector: 'Regulatory coercion or technical attack against project maintainers.',
      mitigation: 'FreePress has ZERO application backend. There is no Express server, no serverless lambda, and no developer database. Content queries and feed updates communicate directly with decentralized Swarm nodes.',
      residualRisk: 'None for content publishing and reading. The application code is open-source and sovereign.',
    },
    {
      id: 'centralized-db',
      name: '4. Centralized Database',
      icon: Database,
      controller: 'Database administrators / cloud DB services (Postgres, Mongo, Supabase)',
      failureMode: 'Database deletion, SQL injection, state corruption, or subpoenas demanding deletion of specific article IDs.',
      attackVector: 'Direct database seizure, admin credential compromise, or targeted record deletion.',
      mitigation: 'All article data lives as content-addressed chunks on Ethereum Swarm. Chunks cannot be selectively edited or deleted by an administrator.',
      residualRisk: 'Storage nodes in the neighborhood must receive valid postage stamp incentives to retain chunk copies.',
    },
    {
      id: 'shared-drive',
      name: '5. Shared-Drive Archive',
      icon: HardDrive,
      controller: 'Corporate cloud storage (Google Drive, Dropbox, OneDrive)',
      failureMode: 'Shared drive folders flagged for ToS violations and locked, locking journalists out of their historical reporting archives.',
      attackVector: 'Automated content scanning, account flagging, or legal notices served to drive providers.',
      mitigation: 'Articles and versions are preserved immutably across the distributed Swarm network. Every version receives a cryptographic content hash that cannot be revoked.',
      residualRisk: 'Unfunded postage batches may result in chunks becoming eligible for garbage collection over long dormancy periods.',
    },
    {
      id: 'bee-node',
      name: '6. Bee Node Availability',
      icon: Radio,
      controller: 'Node operators (the publisher or third-party node providers)',
      failureMode: 'The publisher’s Bee node crashes, runs out of disk space, or is blocked by local ISP firewalls.',
      attackVector: 'DDoS on node port, ISP IP blocking, or hardware failure.',
      mitigation: 'Bee endpoints are completely configurable in Settings. The publisher can switch nodes instantly, run Bee behind a VPN, or connect to multiple remote Bee nodes.',
      residualRisk: 'A publisher must have access to at least one reachable Bee API node to publish new articles or sign feed updates.',
    },
    {
      id: 'postage-batch',
      name: '7. Postage Stamp Batch Exhaustion',
      icon: Stamp,
      controller: 'Publisher and Swarm smart contract economics (xDai/Gnosis chain BZZ)',
      failureMode: 'Postage stamp batch runs out of funds, expires, or utilization reaches 100%, causing new uploads to fail or old chunks to be evicted.',
      attackVector: 'Financial exhaustion, token depletion, or neglecting to top up batch depth.',
      mitigation: 'FreePress provides real-time Postage Status monitoring, utilization progress bars, and depth reporting. Clear warnings alert the publisher before a batch is exhausted.',
      residualRisk: 'Swarm storage is strictly not free; publishers must manage their BZZ postage economics to guarantee content longevity.',
    },
    {
      id: 'private-key',
      name: '8. Publisher Private Key',
      icon: KeyRound,
      controller: 'Publisher (Divya) on her local device',
      failureMode: 'Device theft, malware/keylogger infection, accidental key deletion without backup, or phishing.',
      attackVector: 'Client-side malware, browser extension compromise, or physical laptop seizure.',
      mitigation: 'Keys are generated and signed strictly client-side. Keys are held in volatile browser session memory only (never sent to any server, never hardcoded). Publisher can export and backup encrypted keys.',
      residualRisk: 'If Divya loses her private key, she can never update her Swarm Feed again. If the key is stolen, an adversary could publish impersonated feed updates.',
    },
    {
      id: 'gateway',
      name: '9. Gateway Availability',
      icon: Globe,
      controller: 'Public gateway providers (ethswarm.org, community gateway operators)',
      failureMode: 'A public gateway goes down, blocks certain IP ranges, or gets censored by national firewalls.',
      attackVector: 'National DNS/IP blocking of gateway domains or gateway overload.',
      mitigation: 'FreePress supports custom gateway overrides in Settings. Readers can point to any alternative gateway or run their own local Bee node.',
      residualRisk: 'Non-technical readers who rely exclusively on a blocked default gateway will experience connection errors until switching gateways.',
    },
    {
      id: 'dns',
      name: '10. DNS Resolution',
      icon: Globe,
      controller: 'ISPs and Centralized DNS resolvers (Google 8.8.8.8, Cloudflare 1.1.1.1, telecom resolvers)',
      failureMode: 'DNS poisoning or ISP-level blocking of domain names pointing to gateways.',
      attackVector: 'State-sponsored ISP censorship, SNI filtering, or DNS tampering.',
      mitigation: 'Permanent publishing links can be shared as raw IP/port, ENS domains, or native Swarm addresses (bzz://<owner>/<topic>). Decentralized DNS alternatives (ENS, Handshake) bypass ICANN.',
      residualRisk: 'Circumventing ISP-level SNI filtering or deep-packet inspection still requires privacy tooling such as Tor, WireGuard, or decentralised VPNs.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="pb-6 border-b border-slate-800 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-900 text-rose-300 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>SECURITY &amp; CENSORSHIP THREAT MODEL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Censorship Threat Points &amp; Architecture Mitigations
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          True security requires realistic threat modeling rather than false promises of "absolute censorship immunity". Below is a comprehensive audit of all 10 potential points of failure, identifying the threat vectors, who controls each component, and how FreePress systematically mitigates them.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Architectural Honesty: No Platform Has Zero Dependencies</span>
        </div>
        <p>
          Ethereum Swarm solves content addressing, decentralized distributed storage, and tamper-proof feed signing. However, gateways, DNS, publisher key management, local ISP connectivity, and postage stamp economics remain real-world operational factors. FreePress makes all endpoints configurable and gives complete sovereignty to the journalist.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>The 10 Censorship Attack Vectors</span>
          <span className="text-xs text-slate-500 font-mono">(Comprehensive Analysis)</span>
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {threatPoints.map(point => {
            const Icon = point.icon;
            return (
              <div
                key={point.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{point.name}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                    Controlled by: {point.controller}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-950 space-y-1">
                    <span className="font-semibold text-rose-400 block">Failure Mode &amp; Attack Vector:</span>
                    <p className="text-slate-300 leading-relaxed">{point.failureMode}</p>
                    <p className="text-slate-400 text-[11px] pt-1"><strong>Vector:</strong> {point.attackVector}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-950 space-y-1">
                    <span className="font-semibold text-cyan-400 block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> FreePress Mitigation:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{point.mitigation}</p>
                    <p className="text-amber-400/90 text-[11px] pt-1"><strong>Residual Dependency:</strong> {point.residualRisk}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
