import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Radio,
  Stamp,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useSwarmConfig } from '../hooks/useSwarmConfig';
import { isValidUrl, isValidPostageBatchId } from '../utils/validation';

export const Settings: React.FC = () => {
  const { config, health, gatewayReachable, batchInfo, checking, checkConnectivity, updateConfig, resetToDefault } =
    useSwarmConfig();

  const [beeApiUrl, setBeeApiUrl] = useState(config.beeApiUrl);
  const [gatewayUrl, setGatewayUrl] = useState(config.gatewayUrl);
  const [postageBatchId, setPostageBatchId] = useState(config.postageBatchId);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isValidUrl(beeApiUrl)) {
      setValidationError('Invalid Bee API URL. Must start with http:// or https://');
      return;
    }

    if (!isValidUrl(gatewayUrl)) {
      setValidationError('Invalid Swarm Gateway URL. Must start with http:// or https://');
      return;
    }

    if (postageBatchId.trim() && !isValidPostageBatchId(postageBatchId.trim())) {
      setValidationError('Invalid Postage Batch ID format. Must be a 64-character hexadecimal string.');
      return;
    }

    updateConfig({
      beeApiUrl: beeApiUrl.trim(),
      gatewayUrl: gatewayUrl.trim(),
      postageBatchId: postageBatchId.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    resetToDefault();
    setBeeApiUrl('http://localhost:1633');
    setGatewayUrl('http://localhost:1633');
    setPostageBatchId('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Swarm Node &amp; Gateway Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure custom Bee nodes, Swarm gateways, and postage stamp batches. These settings apply globally across client uploads and reader queries.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configuration saved successfully and applied across FreePress!</span>
        </div>
      )}

      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-900 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Bee Node API URL</span>
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                    health.isReachable ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.isReachable ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  {health.isReachable ? 'Online' : 'Unreachable'}
                </span>
                <button
                  type="button"
                  onClick={checkConnectivity}
                  disabled={checking}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  title="Check health now"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={beeApiUrl}
              onChange={e => setBeeApiUrl(e.target.value)}
              placeholder="http://localhost:1633"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              required
            />
            <p className="text-[11px] text-slate-500">
              The endpoint of your local or remote Bee node used to upload chunks, sign feed updates, and manage postage stamps. (Default: <code className="text-slate-400">http://localhost:1633</code>)
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Swarm Gateway URL</span>
              </label>
              {gatewayReachable !== null && (
                <span
                  className={`text-[11px] font-medium ${
                    gatewayReachable ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {gatewayReachable ? 'Reachable' : 'Unreachable'}
                </span>
              )}
            </div>
            <input
              type="text"
              value={gatewayUrl}
              onChange={e => setGatewayUrl(e.target.value)}
              placeholder="http://localhost:1633 or https://gateway.ethswarm.org"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              required
            />
            <p className="text-[11px] text-slate-500">
              Used as the fallback public gateway for readers without a local Bee node.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Stamp className="w-4 h-4 text-cyan-400" />
                <span>Postage Stamp Batch ID</span>
              </label>
              {batchInfo && (
                <span
                  className={`text-[11px] font-medium ${
                    batchInfo.usable ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {batchInfo.usable ? 'Usable' : 'Unusable / Expired'}
                </span>
              )}
            </div>
            <input
              type="text"
              value={postageBatchId}
              onChange={e => setPostageBatchId(e.target.value)}
              placeholder="e.g. 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              64-hex character batch identifier purchased via <code className="text-slate-400">bee-cli</code> or Bee Stamp API. Required for uploading content.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
