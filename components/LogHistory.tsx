import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { HistoryIcon } from './icons/HistoryIcon';
import type { LogEntry } from '../types';

interface LogHistoryProps {
  logs: LogEntry[];
  onPublish: (logId: string, facebookPostId: string) => Promise<void>;
}

const Countdown: React.FC<{ scheduledTimestamp: string }> = ({ scheduledTimestamp }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(scheduledTimestamp) - +new Date();
        let timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents: string[] = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval as keyof typeof timeLeft]) {
            return;
        }
        timerComponents.push(
            `${timeLeft[interval as keyof typeof timeLeft]} ${interval.slice(0,1)}`
        );
    });
    
    return <span className="text-xs ml-2 text-purple-500">({timerComponents.join(' ') || 'กำลังโพสต์...'})</span>;
};


const StatusBadge: React.FC<{ status: 'Generated' | 'Posted' | 'Scheduled' | 'Failed' }> = ({ status }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  const statusClasses = {
    Generated: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Posted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    Failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  const statusText = {
      Generated: 'สร้างแล้ว',
      Posted: 'โพสต์แล้ว',
      Scheduled: 'ตั้งเวลาแล้ว',
      Failed: 'ล้มเหลว'
  }
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{statusText[status]}</span>;
};


export const LogHistory: React.FC<LogHistoryProps> = ({ logs, onPublish }) => {
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handlePublishClick = async (logId: string, facebookPostId: string) => {
    setPublishingId(logId);
    await onPublish(logId, facebookPostId);
    setPublishingId(null);
  }

  return (
    <Card title="ประวัติการสร้างโพสต์" icon={<HistoryIcon />}>
      {logs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">ยังไม่มีประวัติการสร้างโพสต์</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {log.mediaType === 'video' ? (
                <video src={log.thumbnailUrl} muted className="w-16 h-16 object-cover rounded-md mr-4" />
              ) : (
                <img src={log.thumbnailUrl} alt="Post thumbnail" className="w-16 h-16 object-cover rounded-md mr-4" />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                   <div className="flex items-center">
                    <StatusBadge status={log.status} />
                    {log.status === 'Scheduled' && log.scheduledTimestamp && <Countdown scheduledTimestamp={log.scheduledTimestamp} />}
                   </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(log.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 whitespace-pre-wrap">{log.content}</p>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Page ID: {log.pageId}</p>
                    {log.status === 'Posted' && log.privacy === 'unpublished' && log.facebookPostId && (
                        <button 
                            onClick={() => handlePublishClick(log.id, log.facebookPostId!)}
                            disabled={publishingId === log.id}
                            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-wait"
                        >
                            {publishingId === log.id ? 'กำลังเผยแพร่...' : 'แสดงบนฟีด'}
                        </button>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};