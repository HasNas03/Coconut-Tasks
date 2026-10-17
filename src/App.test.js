import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('shows the loading screen before revealing the app', () => {
  jest.useFakeTimers();
  try {
    const { container } = render(<App />);
    const loader = screen.getByRole('status', { name: 'Loading portfolio' });
    const squares = container.querySelectorAll('.loading-screen__square');

    expect(screen.getByText('Coconut')).toBeInTheDocument();
    expect(loader).toHaveTextContent('Loading portfolio');
    expect(squares).toHaveLength(5);
    expect(Array.from(squares, square => square.style.getPropertyValue('--loader-delay')))
      .toEqual(['140ms', '410ms', '680ms', '950ms', '1220ms']);
    expect(document.body).toHaveClass('portfolio-is-loading');

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(loader).toHaveClass('loading-screen--revealing');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('status', { name: 'Loading portfolio' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass('portfolio-is-loading');
  } finally {
    jest.useRealTimers();
  }
});

test('adds a task from the planner', () => {
  render(<App />);

  expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Enter a task'), {
    target: { value: 'Read a chapter' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

  expect(screen.getByText('Read a chapter')).toBeInTheDocument();
  expect(screen.getByText('1 task planned')).toBeInTheDocument();
  expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument();
});

test('restores saved tasks after the app is mounted again', () => {
  const { unmount } = render(<App />);
  fireEvent.change(screen.getByLabelText('Enter a task'), {
    target: { value: 'Water the plants' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

  expect(JSON.parse(window.localStorage.getItem('coconut-tasks'))).toEqual([
    { id: 0, text: 'Water the plants', done: false },
  ]);

  unmount();
  render(<App />);

  expect(screen.getByText('Water the plants')).toBeInTheDocument();
});

test('updates completion progress and saves completed tasks', () => {
  render(<App />);
  const input = screen.getByLabelText('Enter a task');
  const addButton = screen.getByRole('button', { name: 'Add task' });

  ['Read a chapter', 'Water the plants'].forEach(task => {
    fireEvent.change(input, { target: { value: task } });
    fireEvent.click(addButton);
  });

  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuetext',
    '0 of 2 tasks completed'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Complete Read a chapter' }));

  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuetext',
    '1 of 2 tasks completed'
  );
  expect(JSON.parse(window.localStorage.getItem('coconut-tasks'))[0].done).toBe(true);
});

test('toggles completion by clicking the task row without toggling on control clicks', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Enter a task'), {
    target: { value: 'Write a note' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

  fireEvent.click(screen.getByText('Write a note'));
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuetext',
    '1 of 1 tasks completed'
  );

  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuetext',
    '1 of 1 tasks completed'
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('reorders tasks as a dragged task passes over another task', () => {
  render(<App />);
  const input = screen.getByLabelText('Enter a task');
  const addButton = screen.getByRole('button', { name: 'Add task' });

  ['First task', 'Second task'].forEach(task => {
    fireEvent.change(input, { target: { value: task } });
    fireEvent.click(addButton);
  });

  const dataTransfer = {
    effectAllowed: '',
    dropEffect: '',
    setData: jest.fn(),
  };
  const firstTaskHandle = screen.getByRole('button', { name: /reorder first task/i });
  const secondTaskRow = screen.getAllByRole('listitem')[1];

  fireEvent.dragStart(firstTaskHandle, { dataTransfer });
  fireEvent.dragOver(secondTaskRow, { dataTransfer });

  expect(
    screen.getAllByRole('listitem').map(item => item.querySelector('.text').textContent)
  ).toEqual(['Second task', 'First task']);
});

test('requires confirmation before deleting a task', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Enter a task'), {
    target: { value: 'Review notes' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Review notes')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Never Mind' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Review notes')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete task' }));
  expect(screen.queryByText('Review notes')).not.toBeInTheDocument();
});
