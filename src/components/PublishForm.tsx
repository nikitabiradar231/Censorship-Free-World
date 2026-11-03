import React, { useState } from 'react';
import {
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  FileText,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { Article, PublishedArticleRecord } from '../types/article';
import { uploadArticleToSwarm } from '../services/swarmUpload';
import { updateSwarmFeed, deriveTopic } from '../services/swarmFeed';
import { validateArticle } from '../utils/validation';
import { topicStringToIdentifier } from '../utils/formatters';
import { CopyLinkButton } from './CopyLinkButton';

interface PublishFormProps {
  initialArticle?: Partial<Article>;
  activePrivateKey?: string | null;
  activeAddress?: string | null;
  postageBatchId: string;
  beeApiUrl: string;
  onPublishSuccess: (record: PublishedArticleRecord) => void;
  onRequestKeySetup: () => void;
  isUpdating?: boolean;
}

export const PublishForm: React.FC<PublishFormProps> = ({
  initialArticle,
  activePrivateKey,
  activeAddress,
  postageBatchId,
  beeApiUrl,
  onPublishSuccess,
  onRequestKeySetup,
  isUpdating = false,
}) => {
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || '');
  const [author, setAuthor] = useState(initialArticle?.author || 'Divya');
  const [category, setCategory] = useState(initialArticle?.category || 'Investigative');
  const [content, setContent] = useState(
    initialArticle?.content ||
      '## District Water Supply Contamination Investigation\n\n' +
      'Independent water sample tests across 14 municipal wards reveal chemical levels far exceeding safe potable limits. Centralized hosting accounts were suspended after initial reports, but this reporting now lives immutably on Ethereum Swarm.'
  );
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || '');
  const [topicSlug, setTopicSlug] = useState(
    initialArticle?.feedTopic || 'divya-water-investigation'
  );

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [publishResult, setPublishResult] = useState<{
    swarmReference: string;
    permanentReaderLink: string;
    feedTopic: string;
    version: number;
  } | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handleSaveDraft = () => {
    const draft = {
      title,
      subtitle,
      author,
      category,
      content,
      coverImage,
      topicSlug,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('freepress_active_draft', JSON.stringify(draft));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch {
      // Ignore
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setValidationErrors([]);
    setPublishResult(null);

    if (!activePrivateKey || !activeAddress) {
      onRequestKeySetup();
      return;
    }

    if (!postageBatchId || postageBatchId.trim().length === 0) {
      setPublishError(
        'A Postage Stamp Batch ID is required to upload content and update the Swarm Feed. Please configure a valid batch in Settings or top bar.'
      );
      return;
    }

    const version = (initialArticle?.version || 0) + 1;
    const deterministicTopic = deriveTopic(topicSlug).toHex();

    const articlePayload: Article = {
      id: topicSlug || topicStringToIdentifier(title),
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      author: author.trim(),
      category: category.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || undefined,
      publishedAt: initialArticle?.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version,
      feedTopic: `0x${deterministicTopic}`,
      feedOwner: activeAddress,
      previousReference: initialArticle?.previousReference,
    };

    const errors = validateArticle(articlePayload);
    if (errors.length > 0) {
      setValidationErrors(errors.map(err => `${err.field}: ${err.message}`));
      return;
    }

    setIsSubmitting(true);

    try {
      // STEP 1: Upload Article Content to Swarm
      setCurrentStep('1/3 Serializing & uploading article content chunk to Swarm...');
      const uploadRes = await uploadArticleToSwarm(articlePayload, postageBatchId, beeApiUrl);

      // STEP 2: Client-Side Cryptographic Feed Signing
      setCurrentStep('2/3 Signing Swarm Feed update locally in browser with private key...');

      // STEP 3: Publish signed Feed Update to Swarm
      setCurrentStep('3/3 Publishing signed feed update to Ethereum Swarm network...');
      const feedRes = await updateSwarmFeed({
        topicInput: topicSlug,
        privateKey: activePrivateKey,
        postageBatchId,
        referenceHex: uploadRes.swarmReference,
        customBeeUrl: beeApiUrl,
      });

      const record: PublishedArticleRecord = {
        article: articlePayload,
        swarmReference: uploadRes.swarmReference,
        feedTopic: feedRes.topic,
        feedOwner: feedRes.owner,
        feedManifestReference: feedRes.feedManifestReference,
        publishedAt: articlePayload.updatedAt || articlePayload.publishedAt,
        status: 'published',
      };

      setPublishResult({
        swarmReference: uploadRes.swarmReference,
        permanentReaderLink: feedRes.permanentReaderLink,
        feedTopic: feedRes.topic,
        version,
      });

      onPublishSuccess(record);
    } catch (err: any) {
      setPublishError(err.message || 'Publishing failed. Please check your Bee node and postage batch.');
    } finally {
      setIsSubmitting(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handlePublish} className="space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-cyan-400" />
                {isUpdating ? 'Update Published Article' : 'Compose & Publish to Swarm'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Articles are cryptographically signed on your machine and stored immutably on Ethereum Swarm.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{draftSaved ? 'Draft Saved!' : 'Save Local Draft'}</span>
              </button>
            </div>
          </div>

          {/* Publisher Identity Badge */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Signing Identity:</span>
              {activeAddress ? (
                <span className="font-mono text-cyan-300 font-medium">{activeAddress}</span>
              ) : (
                <span className="text-rose-400 font-medium">No Key Connected (Required to sign)</span>
              )}
            </div>
            {!activeAddress && (
              <button
                type="button"
                onClick={onRequestKeySetup}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" /> Connect / Generate Key
              </button>
            )}
          </div>

          {/* Validation & Publish Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/80 text-xs text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-200">
                <AlertCircle className="w-4 h-4" /> Please resolve the following errors:
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {publishError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/80 text-xs text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-200">
                <AlertCircle className="w-4 h-4" /> Publish Failed:
              </div>
              <p className="leading-relaxed">{publishError}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Article Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., District Water Supply Contamination Investigation"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subtitle / Executive Summary
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Brief one-sentence context for community readers"
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Author Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Divya"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Investigative">Investigative</option>
                  <option value="Community Reporting">Community Reporting</option>
                  <option value="Human Rights">Human Rights</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Public Health">Public Health</option>
                  <option value="Research & Archive">Research & Archive</option>
                  <option value="Editorial">Editorial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Feed Topic Identifier <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={topicSlug}
                  onChange={e => setTopicSlug(e.target.value)}
                  placeholder="e.g., divya-water-investigation"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Determines your permanent reader link topic. Keep identical across updates!
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Article Body (Markdown supported) <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={12}
                placeholder="Write your reporting in Markdown..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm font-mono leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-y"
                required
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Supports headings (##), lists, bold, italics, and quotes</span>
                <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Optional Cover Image URL or Swarm Reference
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="https://... or swarm reference"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Signed locally &bull; Uploads directly to Swarm &bull; Never routes through a developer server</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg cursor-pointer ${
                isSubmitting
                  ? 'bg-cyan-800/50 text-cyan-200 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing to Swarm...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isUpdating ? 'Update Article on Swarm Feed' : 'Publish Article to Swarm'}</span>
                </>
              )}
            </button>
          </div>

          {isSubmitting && currentStep && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-300 flex items-center gap-2.5 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
              <span>{currentStep}</span>
            </div>
          )}
        </div>
      </form>

      {/* Success Modal / Banner */}
      {publishResult && (
        <div className="p-6 md:p-8 rounded-2xl bg-emerald-950/30 border border-emerald-800/80 backdrop-blur-sm space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6" />
            <span>Article Published to Ethereum Swarm (Version {publishResult.version})</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your article chunk is stored immutably on Ethereum Swarm, and your Swarm Feed pointer has been signed and updated. Readers using your permanent link will resolve this new version immediately.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Permanent Reader Link (Share this with readers):
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-emerald-900/60">
                <span className="font-mono text-xs text-cyan-300 truncate flex-1">
                  {publishResult.permanentReaderLink}
                </span>
                <CopyLinkButton text={publishResult.permanentReaderLink} label="Copy Link" />
                <a
                  href={publishResult.permanentReaderLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Open Reader in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Content Swarm Hash (Reference):</span>
                <span className="font-mono text-cyan-400 break-all select-all">
                  {publishResult.swarmReference}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Swarm Feed Topic:</span>
                <span className="font-mono text-slate-300 break-all select-all">
                  {publishResult.feedTopic}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
