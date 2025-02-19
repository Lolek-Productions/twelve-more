'use client';

import tasks from "@/data/tasks";


export default function Tasks() {
  return (
    <div className='mt-3 text-gray-700 space-y-3 bg-gray-100 rounded-xl pt-2'>
      <h4 className='font-bold text-xl px-4'>Tasks</h4>
      {tasks.map((task) => (
        <div key={task.id}>
          <a href='#' target='_blank'>
            <div className='flex items-center justify-between px-4 py-2 space-x-1 hover:bg-gray-200 transition duration-200'>
              <div className='space-y-0.5'>
                <h6 className='text-sm font-bold'>{task.name}</h6>
                <div className='text-xs'>@{task.assigned_to}</div>
                <p className='text-xs font-medium text-gray-500'>
                  {task.description}
                </p>
              </div>
              {/*<img src={task.urlToImage} width={70} className='rounded-xl' />*/}
            </div>
          </a>
        </div>
      ))}
      <button
        // onClick={() => setArticleNum(articleNum + 3)}
        className='text-blue-300 pl-4 pb-3 hover:text-blue-400 text-sm'
      >
        Load more
      </button>
    </div>
  );
}
