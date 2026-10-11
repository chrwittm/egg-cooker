import { mount } from 'svelte';
import MediaLab from './MediaLab.svelte';
import './style.css';
const target = document.getElementById('app');
if (!target) throw new Error('Application root is missing');
mount(MediaLab, { target });
target.querySelector('#media-startup')?.remove();
