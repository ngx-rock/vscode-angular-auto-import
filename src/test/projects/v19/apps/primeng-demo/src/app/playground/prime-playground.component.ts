import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete/autocomplete.interface';
import { SelectButtonChangeEvent } from 'primeng/selectbutton/selectbutton.interface';
import {
  primeBreadcrumbHome,
  primeBreadcrumbItems,
  primeCities,
  primeContextItems,
  primeMenuItems,
  primeModes,
  PrimeProduct,
  primeProducts,
  primeTeams,
} from '../shared/prime-playground.data';
import { Toast } from 'primeng/toast';
import { Menubar } from 'primeng/menubar';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Button, ButtonDirective } from 'primeng/button';
import { Panel } from 'primeng/panel';
import { Badge } from 'primeng/badge';
import { Avatar } from 'primeng/avatar';
import { Chip } from 'primeng/chip';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Ripple } from 'primeng/ripple';
import { StyleClass } from 'primeng/styleclass';
import { Message } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';
import { AutoComplete } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Checkbox } from 'primeng/checkbox';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { SelectButton } from 'primeng/selectbutton';
import { ColorPicker } from 'primeng/colorpicker';
import { BlockUI } from 'primeng/blockui';
import { Dialog } from 'primeng/dialog';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ProgressBar } from 'primeng/progressbar';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Skeleton } from 'primeng/skeleton';
import { Divider } from 'primeng/divider';
import { ContextMenu } from 'primeng/contextmenu';
import { TableModule } from 'primeng/table';
import { ScrollTop } from 'primeng/scrolltop';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-prime-playground',
  standalone: true,
  imports: [
    Toast,
    Menubar,
    Breadcrumb,
    Button,
    Panel,
    Badge,
    Avatar,
    Chip,
    Tag,
    Tooltip,
    Ripple,
    ButtonDirective,
    StyleClass,
    Message,
    FloatLabel,
    AutoComplete,
    FormsModule,
    Select,
    DatePicker,
    Checkbox,
    ToggleSwitch,
    SelectButton,
    ColorPicker,
    BlockUI,
    Dialog,
    Tabs,
    Tab,
    TabList,
    TabPanels,
    TabPanel,
    ProgressBar,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    Skeleton,
    Divider,
    ContextMenu,
    TableModule,
    ScrollTop,
    InputText,
    InputNumber,
  ],
  templateUrl: './prime-playground.component.html',
  styleUrl: './prime-playground.component.css',
})
export class PrimePlaygroundComponent {
  private readonly messageService = inject(MessageService);

  readonly menuItems = primeMenuItems;
  readonly breadcrumbHome = primeBreadcrumbHome;
  readonly breadcrumbItems = primeBreadcrumbItems;
  readonly contextItems = primeContextItems;
  readonly cities = primeCities;
  readonly modeOptions = primeModes;
  readonly teams = primeTeams;

  products: PrimeProduct[] = [...primeProducts];
  selectedCity = this.cities[0];
  selectedDate = new Date('2026-03-14');
  quantity = 42;
  selectedMode = 'parser';
  notificationsEnabled = true;
  panelBlocked = false;
  dialogVisible = false;
  overlaySuggestions: string[] = ['Dialog', 'Toast', 'Tooltip'];
  selectedOverlays: string[] = ['Dialog', 'Toast'];
  themeColor = '#2563eb';
  coverage = 73;

  searchOverlay(event: AutoCompleteCompleteEvent): void {
    const query = (event.query ?? '').toLowerCase();
    this.overlaySuggestions = ['Dialog', 'Toast', 'Tooltip', 'ContextMenu'].filter(item =>
      item.toLowerCase().includes(query),
    );
  }

  showToast(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'PrimeNG',
      detail: 'Toast visible for e2e verification',
    });
  }

  toggleBlock(): void {
    this.panelBlocked = !this.panelBlocked;
  }

  handleModeChange(event: SelectButtonChangeEvent): void {
    this.selectedMode = event.value;
  }
}
