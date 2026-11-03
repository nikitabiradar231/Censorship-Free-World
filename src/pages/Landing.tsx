import React from 'react';
import { Link } from 'react-router-dom';
import {
  RadioTower,
  ShieldAlert,
  HardDrive,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Globe,
  Database,
  ServerOff,
  UserCheck,
} from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="space-y-24 py-6 md:py-12">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-semibold tracking-wide">
          <RadioTower className="w-4 h-4 text-cyan-400" />
          <span>ROAD TO DEVCON XI / BUILD BATTLE CHALLENGE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Your Voice Cannot Be Silenced by <span className="text-cyan-400 underline decoration-cyan-500/50">One Server</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          FreePress is a genuinely decentralized publishing platform built on Ethereum Swarm. Publish immutable reports, update content dynamically through signed Swarm Feeds, and give your readers a single, permanent link that survives hosting suspensions, domain freezes, and infrastructure shutdowns.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/publish"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Publish Article to Swarm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <span>Open Publisher Dashboard</span>
          </Link>
          <Link
            to="/security"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Threat Model</span>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Static Frontend
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Backend Runtime
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Client-Side ECDSA Signatures
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Swarm Feed Dynamic Pointer
          </span>
        </div>
      </section>

      {/* Real-World Persona & Problem: Divya */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 md:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Target Persona &amp; The Problem FreePress Solves</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Meet Divya: Independent Community Journalist
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Divya is the editor of a two-person community newsroom investigating a district water-supply contamination scandal. Within thirty days of publishing:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-rose-300 flex items-start gap-2.5">
                <ServerOff className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>Web hosting account suspended after a legal notice was served to the host.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-rose-300 flex items-start gap-2.5">
                <Globe className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>Domain registrar froze the publication domain name without a court trial.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-rose-300 flex items-start gap-2.5">
                <Database className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>Cloud shared-drive investigation archive was flagged and locked.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-rose-300 flex items-start gap-2.5">
                <LinkIcon className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>All previously shared links went dark, cutting citizens off from critical health data.</span>
              </div>
            </div>

            <div className="pt-4 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-200 space-y-1.5">
              <p className="font-semibold text-cyan-300">
                Divya’s Core Requirement:
              </p>
              <p className="leading-relaxed">
                "She wants to publish tonight. She wants to share <strong>only one permanent link</strong> with her readers. When she publishes updates or new follow-ups, readers must receive the latest version through that exact same link directly from Ethereum Swarm—without depending on an app developer's server or domain."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Publishing Works */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How Censorship-Resistant Publishing Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A three-step immutable pipeline powered by cryptographic content addressing and Swarm Feeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-white">Immutable Swarm Chunk Upload</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The article content is serialized into JSON and uploaded directly to Ethereum Swarm via a configured Bee node and postage batch. Swarm calculates a deterministic 64-character hash (Swarm Reference). Chunks are distributed across decentralized storage nodes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-white">Client-Side ECDSA Feed Signing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The publisher signs a Single Owner Chunk (SOC) feed update on their own browser using their sovereign private key. The feed update points from the publisher's stable (Owner + Topic) identifier to the newly created content hash.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-white">Single Permanent Reader Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Readers open the permanent link <code className="text-cyan-300 text-[11px]">#/read?owner=...&amp;topic=...</code>. FreePress queries Swarm directly for the latest feed index, fetches the content chunk, and renders the latest reporting with zero wallet connection required.
            </p>
          </div>
        </div>
      </section>

      {/* Swarm Technology Explanation */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 md:p-12 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Decentralized Swarm Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Why Ethereum Swarm is uniquely suited for censorship-resistant journalism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>Content Addressing (BZZ)</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                In centralized hosting, a file is retrieved by its location (e.g. server IP or URL path). If the host deletes it, the content is lost. In Ethereum Swarm, content is retrieved by its cryptographic hash. Content cannot be altered or substituted without changing its address.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Swarm Feeds (Mutable Pointers)</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                While content hashes change whenever an article is updated, a Swarm Feed provides a stable cryptographic mailbox identified by the publisher's Ethereum address and a topic identifier. Only the holder of the private key can sign and publish updates to that feed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Postage Stamp Batches</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Storage persistence on Swarm is incentivized through postage stamp batches purchased with BZZ tokens. Nodes in the neighborhood store chunks based on proof-of-reserve. Chunks with valid postage batches are protected against eviction.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Gateway Agnosticism</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Readers are never locked into the application developer's gateway. If a public gateway goes offline or blocks traffic, readers can switch to any other Swarm gateway or their own local Bee node to resolve the feed and read articles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="text-center max-w-3xl mx-auto px-4 py-8 space-y-5">
        <h2 className="text-3xl font-extrabold text-white">
          Ready to Publish Sovereign Journalism?
        </h2>
        <p className="text-sm text-slate-400">
          Connect your Bee node, generate your publisher key, and publish your first article directly to Ethereum Swarm.
        </p>
        <div className="pt-2">
          <Link
            to="/publish"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <span>Get Started &bull; Publish Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

