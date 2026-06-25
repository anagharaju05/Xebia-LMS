import React from 'react';
import CloudIcon from '@mui/icons-material/Cloud';
import CodeIcon from '@mui/icons-material/Code';
import PaletteIcon from '@mui/icons-material/Palette';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import FolderIcon from '@mui/icons-material/Folder';
import GroupsIcon from '@mui/icons-material/Groups';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HubIcon from '@mui/icons-material/Hub';
import HtmlIcon from '@mui/icons-material/Html';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import DnsIcon from '@mui/icons-material/Dns';
import LayersIcon from '@mui/icons-material/Layers';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import TableChartIcon from '@mui/icons-material/TableChart';
import NoteIcon from '@mui/icons-material/Note';

/**
 * Returns a React component for the given icon name string.
 */
export const getIconComponent = (name, props = {}) => {
  if (!name) return <SchoolIcon {...props} />;
  const lowerName = name.toLowerCase().trim();
  switch (lowerName) {
    case 'cloud':
    case 'cloud_queue':
    case 'cloudqueue':
      return <CloudIcon {...props} />;
    case 'code':
      return <CodeIcon {...props} />;
    case 'palette':
    case 'design':
      return <PaletteIcon {...props} />;
    case 'storage':
    case 'database':
      return <StorageIcon {...props} />;
    case 'api':
      return <ApiIcon {...props} />;
    case 'playcircle':
    case 'play':
    case 'video':
      return <PlayCircleIcon {...props} />;
    case 'pictureaspdf':
    case 'pdf':
      return <PictureAsPdfIcon {...props} />;
    case 'slideshow':
    case 'ppt':
      return <SlideshowIcon {...props} />;
    case 'assignmentind':
    case 'quiz':
      return <AssignmentIndIcon {...props} />;
    case 'settings':
      return <SettingsIcon {...props} />;
    case 'folder':
      return <FolderIcon {...props} />;
    case 'school':
      return <SchoolIcon {...props} />;
    case 'groups':
      return <GroupsIcon {...props} />;
    case 'psychology':
      return <PsychologyIcon {...props} />;
    case 'hub':
      return <HubIcon {...props} />;
    case 'html':
      return <HtmlIcon {...props} />;
    case 'menubook':
      return <MenuBookIcon {...props} />;
    case 'settingsethernet':
      return <SettingsEthernetIcon {...props} />;
    case 'dns':
      return <DnsIcon {...props} />;
    case 'layers':
      return <LayersIcon {...props} />;
    case 'trendingup':
      return <TrendingUpIcon {...props} />;
    case 'codeoff':
      return <CodeOffIcon {...props} />;
    case 'tablechart':
      return <TableChartIcon {...props} />;
    case 'note':
      return <NoteIcon {...props} />;
    default:
      return <SchoolIcon {...props} />;
  }
};

/**
 * Automatically decides a matching Material-UI Icon Name based on name and description strings.
 */
export const getAutoIcon = (name = '', description = '') => {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('cloud') || text.includes('gcp') || text.includes('aws') || text.includes('azure') || text.includes('infrastructure')) {
    return 'Cloud';
  }
  if (text.includes('code') || text.includes('program') || text.includes('develop') || text.includes('software') || text.includes('react') || text.includes('javascript') || text.includes('java') || text.includes('python')) {
    return 'Code';
  }
  if (text.includes('database') || text.includes('sql') || text.includes('storage') || text.includes('postgres') || text.includes('mongodb') || text.includes('oracle')) {
    return 'Storage';
  }
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('figma') || text.includes('frontend') || text.includes('palette') || text.includes('css')) {
    return 'Palette';
  }
  if (text.includes('api') || text.includes('rest') || text.includes('endpoint') || text.includes('integration') || text.includes('webhook')) {
    return 'Api';
  }
  if (text.includes('video') || text.includes('play') || text.includes('watch') || text.includes('media') || text.includes('mp4')) {
    return 'PlayCircle';
  }
  if (text.includes('pdf') || text.includes('book') || text.includes('read') || text.includes('document') || text.includes('manual') || text.includes('guide')) {
    return 'PictureAsPdf';
  }
  if (text.includes('slide') || text.includes('deck') || text.includes('ppt') || text.includes('presentation') || text.includes('powerpoint')) {
    return 'Slideshow';
  }
  if (text.includes('quiz') || text.includes('test') || text.includes('exam') || text.includes('question') || text.includes('assignment')) {
    return 'AssignmentInd';
  }
  if (text.includes('setting') || text.includes('config') || text.includes('tool') || text.includes('setup')) {
    return 'Settings';
  }
  
  return 'School'; // Default fallback
};
