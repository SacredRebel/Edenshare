"use client";

import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function ShopReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_author_id_fkey(display_name, avatar_url), listings:listing_id(title)')
        .eq('subject_id', user.id)
        .order('created_at', { ascending: false });
      setReviews(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const distribution = [5,4,3,2,1].map(n => ({ stars: n, count: reviews.filter(r => r.rating === n).length }));

  if (loading) return <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-display text-white mb-6">Reviews</h1>

      {reviews.length > 0 ? (
        <>
          {/* Summary */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6 flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-display text-white">{avgRating.toFixed(1)}</div>
              <div className="flex gap-0.5 justify-center mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-eden-400 fill-eden-400' : 'text-gray-600'}`} />)}</div>
              <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {distribution.map(d => (
                <div key={d.stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-gray-500">{d.stars}</span>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-eden-500 rounded-full" style={{ width: `${reviews.length > 0 ? (d.count / reviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-6 text-gray-500 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-eden-500/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (r.profiles?.display_name || '?')[0]}
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">{r.profiles?.display_name}</span>
                      {r.listings?.title && <p className="text-[10px] text-gray-500">on {r.listings.title}</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-eden-400 fill-eden-400" />)}</div>
                </div>
                {r.comment && <p className="text-sm text-gray-300 leading-relaxed">{r.comment}</p>}
                <p className="text-[10px] text-gray-600 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-500">Reviews will appear here after interactions are completed.</p>
        </div>
      )}
    </div>
  );
}
