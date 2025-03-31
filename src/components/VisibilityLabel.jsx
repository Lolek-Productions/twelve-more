import React from 'react';

import { Badge } from "@/components/ui/badge"


const VisibilityLabel = ({visibility}) => {
  return (
    <div>
      {visibility === 'private' ?
        <Badge className={'bg-gray-500 hover:bg-gray-500'}>Private</Badge> :
        <Badge className={'bg-blue-500 hover:bg-blue-500'}>Public</Badge>
      }
    </div>
  );
};

export default VisibilityLabel;