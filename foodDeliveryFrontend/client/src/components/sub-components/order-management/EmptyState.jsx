import React from 'react';
import { Button } from 'flowbite-react';

const EmptyState = ({ title, description, icon, actionLabel, actionLink }) => (
  <div className="text-center py-10">
    <div className="inline-block p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mt-2">
      {description}
    </p>
    {actionLabel && (
      <Button 
        color="light" 
        className="mt-4" 
        onClick={typeof actionLink === 'function' ? actionLink : undefined}
        href={typeof actionLink === 'string' ? actionLink : undefined}
      >
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;