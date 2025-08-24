import { useState, useCallback, type ReactNode } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import IncomeChart from '../components/charts/IncomeChart';
import { RATIO_BY_COLUMNS } from '../constants/charts';
import BudgetChart from '../components/charts/BudgetChart';
import SpendingChart from '../components/charts/SpendingChart';
import SavingsChart from '../components/charts/SavingsChart';

const SortableItem = ({ id, children }: { id: string; children: ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <Box ref={setNodeRef} sx={{ transform: CSS.Translate.toString(transform), transition }} {...attributes} {...listeners}>
      {children}
    </Box>
  );
};

const Dashboard = () => {
  const [columns, setColumns] = useState(3);
  const [order, setOrder] = useState<string[]>(['income', 'budget', 'spending', 'saving']);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setOrder((items) => arrayMove(items, items.indexOf(active.id as string), items.indexOf(over.id as string)));
    }
  };

  const renderChart = useCallback(
    (id: string) => {
      const ratio = RATIO_BY_COLUMNS[columns];
      switch (id) {
        case 'income':
          return <IncomeChart ratio={ratio} />;
        case 'budget':
          return <BudgetChart ratio={ratio} />;
        case 'spending':
          return <SpendingChart ratio={ratio} />;
        case 'saving':
          return <SavingsChart ratio={ratio} />;
        default:
          return null;
      }
    },
    [columns],
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <ToggleButtonGroup size="small" exclusive value={columns} onChange={(_, v) => v && setColumns(v)} sx={{ mb: 3 }}>
        <ToggleButton value={1}>1 / row</ToggleButton>
        <ToggleButton value={2}>2 / row</ToggleButton>
        <ToggleButton value={3}>3 / row</ToggleButton>
      </ToggleButtonGroup>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 2 }}>
            {order.map((id) => (
              <SortableItem key={id} id={id}>
                {renderChart(id)}
              </SortableItem>
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default Dashboard;
