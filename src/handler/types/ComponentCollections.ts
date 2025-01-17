import { Collection } from 'discord.js';
import type { Modal } from '../components/base/Modal';
import type { Button } from '../components/base/Button';
import type { SelectMenu } from '../components/base/SelectMenu';

export interface ComponentCollections {
  button: Collection<string, Button>;
  selectMenu: Collection<string, SelectMenu>;
  modal: Collection<string, Modal>;
}

export const emptyComponentCollections: ComponentCollections = {
  button: new Collection<string, Button>(),
  selectMenu: new Collection<string, SelectMenu>(),
  modal: new Collection<string, Modal>(),
};
