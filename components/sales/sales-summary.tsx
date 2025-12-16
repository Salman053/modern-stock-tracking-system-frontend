import { Sale } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, Percent } from 'lucide-react';

interface SaleSummaryProps {
    saleData: Sale;
}

export default function SaleSummary({ saleData }: SaleSummaryProps) {
    const remainingAmount = saleData.total_amount - saleData.paid_amount;
    const discountPercentage = saleData.discount > 0
        ? (saleData.discount / saleData.total_amount) * 100
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Sale Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold">
                            Rs. {saleData.total_amount.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            Advance Amount
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                            Rs. {saleData.paid_amount.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Profit</p>
                        <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp className="h-5 w-5" />
                            Rs. {saleData.profit.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Percent className="h-4 w-4" />
                            Discount
                        </p>
                        <p className="text-2xl font-bold text-amber-600">
                            Rs. {saleData.discount.toLocaleString()}
                        </p>
                        {discountPercentage > 0 && (
                            <p className="text-xs text-muted-foreground">
                                ({discountPercentage.toFixed(1)}% off)
                            </p>
                        )}
                    </div>
                </div>

                {/* {remainingAmount > 0 && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Remaining Balance</span>
                            <span className="text-lg font-bold text-destructive">
                                Rs. {remainingAmount.toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-destructive h-2 rounded-full"
                                style={{ width: `${(saleData.paid_amount / saleData.total_amount) * 100}%` }}
                            />
                        </div>
                    </div>
                )} */}
            </CardContent>
        </Card>
    );
}