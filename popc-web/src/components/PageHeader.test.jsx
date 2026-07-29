import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PageHeader from './PageHeader';

describe('PageHeader Component', () => {
  it('renders the header with the provided title', () => {
    render(
      <BrowserRouter>
        <PageHeader title="Test Title" />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
