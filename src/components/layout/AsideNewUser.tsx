import React from 'react';

// import { Container } from './styles';

const layout: React.FC = () => {
  return (
    <aside className="hidden lg:flex w-1/3 flex-col items-center justify-center relative p-16 overflow-hidden bg-[#1A1A1A]">
                <div className="absolute w-full h-full -z-10">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#8B6FFF]/20 rounded-full blur-3xl"></div>
                    <div className="absolute left-10 bottom-10 w-96 h-96 bg-[#4DD4F7]/20 rounded-full blur-3xl"></div>
                </div>
                <div className="relative w-full h-full">
                    {/* Card 1 */}
                    <div className="absolute top-10 right-0 transform translate-x-1/4 -translate-y-1/4 rotate-12">
                        <div className="gradient-icon-card w-48 h-48">
                            <div className="gradient-icon-card-inner">
                                <span className="material-icons text-white/80">auto_awesome</span>
                            </div>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 -rotate-15">
                        <div className="gradient-icon-card w-64 h-64">
                            <div className="gradient-icon-card-inner">
                                <span className="material-icons text-white/80">data_object</span>
                            </div>
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div className="absolute bottom-5 right-1/2 transform translate-x-1/2 translate-y-1/4 rotate-6">
                        <div className="gradient-icon-card w-32 h-32">
                            <div className="gradient-icon-card-inner">
                                <span className="material-icons text-white/80">widgets</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
  );
}

export default layout;