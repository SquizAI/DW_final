# wrangling Feature

## Overview

This documentation is automatically generated for the wrangling feature.

## Files

```
frontend/src/features/wrangling/ColumnManagementPanel.tsx
frontend/src/features/wrangling/DataCleaningPanel.tsx
frontend/src/features/wrangling/DataFilteringPanel.tsx
frontend/src/features/wrangling/DataTransformPanel.tsx
```

## Components



## Dependencies

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/ColumnManagementPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/ColumnManagementPanel.tsx:import { IconColumns, IconTrash, IconPlus } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/ColumnManagementPanel.tsx:import { Stack, Select, MultiSelect, Button, Group, Text, TextInput, ActionIcon, Switch } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/ColumnManagementPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/ColumnManagementPanel.tsx:import { useQuery, useMutation } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataCleaningPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataCleaningPanel.tsx:import { IconWand } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataCleaningPanel.tsx:import { Stack, Select, MultiSelect, Button, Group, Text, Switch, NumberInput, TextInput } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataCleaningPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataCleaningPanel.tsx:import { useQuery, useMutation } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataFilteringPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataFilteringPanel.tsx:import { IconFilter, IconPlus, IconTrash } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataFilteringPanel.tsx:import { Stack, Select, MultiSelect, Button, Group, Text, TextInput, NumberInput, ActionIcon } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataFilteringPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataFilteringPanel.tsx:import { useQuery, useMutation } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataTransformPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataTransformPanel.tsx:import { IconArrowsShuffle } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataTransformPanel.tsx:import { Stack, Select, MultiSelect, Button, Group, Text, TextInput, JsonInput } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataTransformPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/wrangling/DataTransformPanel.tsx:import { useQuery, useMutation } from '@tanstack/react-query';
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025
